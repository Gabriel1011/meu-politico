export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          nome_publico: string
          logo_url: string | null
          cores: Json
          contato: Json | null
          ativo: boolean
          plano: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          nome_publico: string
          logo_url?: string | null
          cores?: Json
          contato?: Json | null
          ativo?: boolean
          plano?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          nome_publico?: string
          logo_url?: string | null
          cores?: Json
          contato?: Json | null
          ativo?: boolean
          plano?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          nome_completo: string | null
          avatar_url: string | null
          role: 'cidadao' | 'assessor' | 'politico' | 'admin'
          active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          email: string
          nome_completo?: string | null
          avatar_url?: string | null
          role?: 'cidadao' | 'assessor' | 'politico' | 'admin'
          active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          email?: string
          nome_completo?: string | null
          avatar_url?: string | null
          role?: 'cidadao' | 'assessor' | 'politico' | 'admin'
          active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          cor: string
          icone: string | null
          ordem: number
          ativa: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          cor?: string
          icone?: string | null
          ordem?: number
          ativa?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          cor?: string
          icone?: string | null
          ordem?: number
          ativa?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          ticket_number: string
          titulo: string
          descricao: string
          categoria_id: string | null
          status: 'nova' | 'em_analise' | 'em_andamento' | 'resolvida' | 'encerrada' | 'cancelada'
          prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
          localizacao: Json | null
          fotos: string[]
          assigned_to: string | null
          metadata: Json
          created_at: string
          updated_at: string
          resolved_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          ticket_number?: string
          titulo: string
          descricao: string
          categoria_id?: string | null
          status?: 'nova' | 'em_analise' | 'em_andamento' | 'resolvida' | 'encerrada' | 'cancelada'
          prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'
          localizacao?: Json | null
          fotos?: string[]
          assigned_to?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          ticket_number?: string
          titulo?: string
          descricao?: string
          categoria_id?: string | null
          status?: 'nova' | 'em_analise' | 'em_andamento' | 'resolvida' | 'encerrada' | 'cancelada'
          prioridade?: 'baixa' | 'media' | 'alta' | 'urgente'
          localizacao?: Json | null
          fotos?: string[]
          assigned_to?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          autor_id: string
          mensagem: string
          publico: boolean
          anexos: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          autor_id: string
          mensagem: string
          publico?: boolean
          anexos?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          autor_id?: string
          mensagem?: string
          publico?: boolean
          anexos?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          }
        ]
      },
      notifications: {
        Row: {
          id: string
          tenant_id: string
          recipient_id: string
          title: string
          message: string | null
          type: string
          metadata: Json
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          recipient_id: string
          title: string
          message?: string | null
          type?: string
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          recipient_id?: string
          title?: string
          message?: string | null
          type?: string
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string
          location: string | null
          start_date: string
          end_date: string
          banner_url: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description: string
          location?: string | null
          start_date: string
          end_date: string
          banner_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string
          location?: string | null
          start_date?: string
          end_date?: string
          banner_url?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_number: {
        Args: {
          p_tenant_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
