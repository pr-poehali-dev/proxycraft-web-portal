import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version: string;
  motd: string;
}

const Index = () => {
  const { toast } = useToast();
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    online: false,
    players: { online: 0, max: 0 },
    version: 'Загрузка...',
    motd: 'Загрузка статуса сервера...'
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const serverIP = 'mc.proxycraft.ru';
  const API_URL = 'https://functions.poehali.dev/3ef20a11-5d8d-4049-be34-8190dd7d130a';

  const copyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    toast({
      title: "IP скопирован!",
      description: "Адрес сервера скопирован в буфер обмена",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`${API_URL}?host=${serverIP}&port=25565`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setServerStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch server status:', error);
      setServerStatus({
        online: false,
        players: { online: 0, max: 0 },
        version: 'Недоступен',
        motd: `Сервер ${serverIP} временно недоступен или не отвечает на запросы`
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerStatus();
    
    const interval = setInterval(() => {
      fetchServerStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20" />
      
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-pulse-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <nav className="border-b border-border/50 glass-effect">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-neon-cyan neon-glow">
              ProxyCraft
            </h1>
            <div className="flex gap-6">
              <a href="#home" className="text-foreground/80 hover:text-neon-cyan transition-colors font-medium">
                Главная
              </a>
              <a href="#status" className="text-foreground/80 hover:text-neon-cyan transition-colors font-medium">
                Статус
              </a>
            </div>
          </div>
        </nav>

        <section id="home" className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-float mb-8">
              <h2 className="text-7xl font-bold mb-4 text-neon-cyan neon-glow">
                PROXYCRAFT
              </h2>
              <p className="text-2xl text-neon-purple font-semibold mb-2">
                Легендарный сервер Minecraft
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Присоединяйся к тысячам игроков прямо сейчас!
              </p>
            </div>

            <Card className="glass-effect border-neon-purple/30 p-8 mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Icon name="Server" className="text-neon-cyan" size={40} />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IP адрес сервера:</p>
                  <p className="text-3xl font-bold text-neon-purple font-mono">{serverIP}</p>
                </div>
              </div>
              <Button
                onClick={copyIP}
                size="lg"
                className="bg-neon-cyan text-background hover:bg-neon-cyan/90 neon-border font-bold text-lg px-8"
              >
                {copied ? (
                  <>
                    <Icon name="Check" className="mr-2" size={20} />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="mr-2" size={20} />
                    Скопировать IP
                  </>
                )}
              </Button>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-effect border-neon-cyan/30 p-6 hover:border-neon-cyan transition-all">
                <Icon name="Users" className="text-neon-cyan mx-auto mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2 text-neon-cyan">Огромное сообщество</h3>
                <p className="text-muted-foreground">Тысячи активных игроков каждый день</p>
              </Card>
              <Card className="glass-effect border-neon-purple/30 p-6 hover:border-neon-purple transition-all">
                <Icon name="Zap" className="text-neon-purple mx-auto mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2 text-neon-purple">Мощные сервера</h3>
                <p className="text-muted-foreground">Без лагов и с высоким FPS</p>
              </Card>
              <Card className="glass-effect border-neon-pink/30 p-6 hover:border-neon-pink transition-all">
                <Icon name="Shield" className="text-neon-pink mx-auto mb-4" size={40} />
                <h3 className="text-xl font-bold mb-2 text-neon-pink">Безопасность</h3>
                <p className="text-muted-foreground">Защита от читеров и гриферов</p>
              </Card>
            </div>
          </div>
        </section>

        <section id="status" className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-12 text-neon-purple neon-glow">
              Статус сервера
            </h2>

            <Card className="glass-effect border-neon-cyan/30 p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" className="text-neon-cyan animate-spin" size={48} />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${serverStatus.online ? 'bg-green-500' : 'bg-red-500'} animate-pulse-glow`} />
                      <div>
                        <p className="text-sm text-muted-foreground">Статус</p>
                        <p className="text-2xl font-bold text-neon-cyan">
                          {serverStatus.online ? 'Онлайн' : 'Оффлайн'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-neon-purple text-neon-purple px-4 py-2 text-lg">
                      {serverStatus.version}
                    </Badge>
                  </div>
                </>
              )}

              {!loading && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="glass-effect border border-neon-cyan/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Users" className="text-neon-cyan" size={24} />
                        <p className="text-sm text-muted-foreground">Игроки онлайн</p>
                      </div>
                      <p className="text-4xl font-bold text-neon-cyan font-mono">
                        {serverStatus.players.online} / {serverStatus.players.max}
                      </p>
                      <div className="mt-4 bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple animate-pulse-glow transition-all duration-500"
                          style={{ width: `${serverStatus.players.max > 0 ? (serverStatus.players.online / serverStatus.players.max) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="glass-effect border border-neon-purple/20 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Activity" className="text-neon-purple" size={24} />
                        <p className="text-sm text-muted-foreground">Версия сервера</p>
                      </div>
                      <p className="text-2xl font-bold text-neon-purple">
                        {serverStatus.version}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {serverStatus.online ? 'Сервер работает стабильно' : 'Сервер недоступен'}
                      </p>
                    </div>
                  </div>

                  <div className="glass-effect border border-neon-pink/20 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="MessageSquare" className="text-neon-pink" size={24} />
                      <p className="text-sm text-muted-foreground">MOTD сервера</p>
                    </div>
                    <p className="text-lg text-foreground whitespace-pre-line">{serverStatus.motd}</p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;