import json
import socket
import struct
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get real-time Minecraft server status
    Args: event - dict with httpMethod, queryStringParameters
          context - object with request_id, function_name
    Returns: HTTP response with server status data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    server_host: str = params.get('host', 'mc.proxycraft.ru')
    server_port: int = int(params.get('port', '25565'))
    
    try:
        status = get_server_status(server_host, server_port)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            'body': json.dumps(status),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'online': False,
                'error': str(e),
                'players': {'online': 0, 'max': 0},
                'version': 'Unknown',
                'motd': 'Server offline'
            }),
            'isBase64Encoded': False
        }


def get_server_status(host: str, port: int, timeout: float = 5.0) -> Dict[str, Any]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    
    try:
        sock.connect((host, port))
        
        handshake = create_handshake_packet(host, port)
        sock.sendall(handshake)
        
        status_request = b'\x01\x00'
        sock.sendall(status_request)
        
        response = read_packet(sock)
        
        status_data = json.loads(response)
        
        return {
            'online': True,
            'players': {
                'online': status_data.get('players', {}).get('online', 0),
                'max': status_data.get('players', {}).get('max', 0)
            },
            'version': status_data.get('version', {}).get('name', 'Unknown'),
            'motd': parse_motd(status_data.get('description', {})),
            'favicon': status_data.get('favicon', '')
        }
    finally:
        sock.close()


def create_handshake_packet(host: str, port: int) -> bytes:
    packet_data = b'\x00'
    packet_data += encode_varint(47)
    packet_data += encode_varint(len(host)) + host.encode('utf-8')
    packet_data += struct.pack('>H', port)
    packet_data += encode_varint(1)
    
    return encode_varint(len(packet_data)) + packet_data


def encode_varint(value: int) -> bytes:
    result = b''
    while True:
        temp = value & 0x7F
        value >>= 7
        if value != 0:
            temp |= 0x80
        result += bytes([temp])
        if value == 0:
            break
    return result


def decode_varint(sock: socket.socket) -> int:
    result = 0
    for i in range(5):
        byte = sock.recv(1)
        if not byte:
            raise ConnectionError('Connection closed')
        
        value = byte[0]
        result |= (value & 0x7F) << (7 * i)
        
        if not value & 0x80:
            break
    return result


def read_packet(sock: socket.socket) -> str:
    length = decode_varint(sock)
    packet_id = decode_varint(sock)
    
    if packet_id != 0x00:
        raise ValueError(f'Invalid packet ID: {packet_id}')
    
    json_length = decode_varint(sock)
    json_data = b''
    
    while len(json_data) < json_length:
        chunk = sock.recv(json_length - len(json_data))
        if not chunk:
            raise ConnectionError('Connection closed while reading JSON')
        json_data += chunk
    
    return json_data.decode('utf-8')


def parse_motd(description: Any) -> str:
    if isinstance(description, str):
        return description
    elif isinstance(description, dict):
        if 'text' in description:
            return description['text']
        elif 'extra' in description:
            return ''.join(part.get('text', '') for part in description['extra'])
    return 'ProxyCraft Server'
