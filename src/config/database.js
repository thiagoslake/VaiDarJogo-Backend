const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class DatabaseConfig {
  constructor() {
    this.supabase = null;
    this.init();
  }

  init() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configurações do Supabase não encontradas');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      logger.info('✅ Conexão com Supabase estabelecida');
    } catch (error) {
      logger.error('❌ Erro ao conectar com Supabase:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.supabase) {
      this.init();
    }
    return this.supabase;
  }

  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('games')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      logger.info('✅ Teste de conexão com banco de dados bem-sucedido');
      return true;
    } catch (error) {
      logger.error('❌ Erro no teste de conexão:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConfig();




