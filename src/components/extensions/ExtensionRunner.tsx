'use client';

import React, { useEffect, useRef } from 'react';

interface ExtensionRunnerProps {
  extensionId: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * ExtensionRunner - Composant pour exécuter les extensions de manière isolée et sécurisée
 * 
 * Ce composant crée un environnement sandbox pour les extensions en utilisant un iframe.
 * Il fournit une API sécurisée pour la communication entre l'extension et l'application principale.
 */
const ExtensionRunner: React.FC<ExtensionRunnerProps> = ({ 
  extensionId, 
  onMessage,
  onError 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Messages de l'extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine du message pour la sécurité
      if (event.origin !== window.location.origin) {
        return;
      }
      
      // Vérifier que le message provient de notre extension
      if (event.data.extensionId !== extensionId) {
        return;
      }
      
      // Traiter les messages de l'extension
      if (onMessage) {
        onMessage(event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [extensionId, onMessage]);
  
  // Initialiser l'extension
  useEffect(() => {
    if (!iframeRef.current) return;
    
    try {
      // Charger le contenu de l'extension dans l'iframe
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        // Créer un environnement sandbox pour l'extension
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Extension ${extensionId}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #ffffff;
                  color: #333333;
                }
                .extension-container {
                  max-width: 1200px;
                  margin: 0 auto;
                }
                .header {
                  border-bottom: 1px solid #e5e5e5;
                  padding-bottom: 16px;
                  margin-bottom: 24px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #333333;
                }
                .content {
                  min-height: 300px;
                }
              </style>
            </head>
            <body>
              <div class="extension-container">
                <div class="header">
                  <h1>Extension ${extensionId}</h1>
                </div>
                <div class="content">
                  <p>L'extension ${extensionId} est en cours d'exécution dans un environnement sécurisé.</p>
                  <p>Cette zone est réservée à l'exécution de l'extension.</p>
                </div>
              </div>
              
              <script>
                // API sécurisée pour l'extension
                const ExtensionAPI = {
                  // Envoyer un message à l'application principale
                  sendMessage: function(data) {
                    parent.postMessage({
                      extensionId: '${extensionId}',
                      type: 'extension-message',
                      data: data
                    }, '*');
                  },
                  
                  // Obtenir les données de l'application principale
                  getAppData: function() {
                    return new Promise((resolve) => {
                      const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
                      
                      // Écouter la réponse
                      const handler = function(event) {
                        if (event.data.type === 'app-data-response' && 
                            event.data.requestId === requestId) {
                          window.removeEventListener('message', handler);
                          resolve(event.data.data);
                        }
                      };
                      
                      window.addEventListener('message', handler);
                      
                      // Demander les données
                      parent.postMessage({
                        extensionId: '${extensionId}',
                        type: 'app-data-request',
                        requestId: requestId
                      }, '*');
                    });
                  },
                  
                  // Accès limité aux APIs du navigateur
                  storage: {
                    setItem: function(key, value) {
                      localStorage.setItem('ext_${extensionId}_' + key, value);
                    },
                    getItem: function(key) {
                      return localStorage.getItem('ext_${extensionId}_' + key);
                    },
                    removeItem: function(key) {
                      localStorage.removeItem('ext_${extensionId}_' + key);
                    }
                  }
                };
                
                // Exposer l'API globalement
                window.ExtensionAPI = ExtensionAPI;
                
                // Informer l'application principale que l'extension est prête
                ExtensionAPI.sendMessage({
                  type: 'extension-ready',
                  timestamp: new Date().toISOString()
                });
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }, [extensionId, onError]);
  
  return (
    <iframe
      ref={iframeRef}
      title={`Extension ${extensionId}`}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full border-0"
      onLoad={() => {
        console.log(`Extension ${extensionId} chargée`);
      }}
    />
  );
};

export default ExtensionRunner;