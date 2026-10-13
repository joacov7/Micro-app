export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      apps: {
        Row: {
          created_at: string
          descripcion: string | null
          estado: Database['public']['Enums']['estado_app']
          id: string
          nombre: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          descripcion?: string | null
          estado?: Database['public']['Enums']['estado_app']
          id: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estado?: Database['public']['Enums']['estado_app']
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          accion: string
          actor: string | null
          created_at: string
          datos: Json | null
          id: number
          org_id: string | null
        }
        ComputedFields: never
        Insert: {
          accion: string
          actor?: string | null
          created_at?: string
          datos?: Json | null
          id?: never
          org_id?: string | null
        }
        Update: {
          accion?: string
          actor?: string | null
          created_at?: string
          datos?: Json | null
          id?: never
          org_id?: string | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          org_id: string
          rol: Database['public']['Enums']['rol_org']
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          org_id: string
          rol?: Database['public']['Enums']['rol_org']
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          rol?: Database['public']['Enums']['rol_org']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'memberships_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_path: string | null
          nombre: string
          rubro: string | null
          telefono: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          logo_path?: string | null
          nombre: string
          rubro?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_path?: string | null
          nombre?: string
          rubro?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          cargado_por: string | null
          created_at: string
          estado: string
          id: string
          id_pago_proveedor: string
          moneda: string
          monto: number
          notas: string | null
          org_id: string
          pagado_el: string
          proveedor: string
          subscription_id: string | null
        }
        ComputedFields: never
        Insert: {
          cargado_por?: string | null
          created_at?: string
          estado?: string
          id?: string
          id_pago_proveedor: string
          moneda?: string
          monto: number
          notas?: string | null
          org_id: string
          pagado_el: string
          proveedor?: string
          subscription_id?: string | null
        }
        Update: {
          cargado_por?: string | null
          created_at?: string
          estado?: string
          id?: string
          id_pago_proveedor?: string
          moneda?: string
          monto?: number
          notas?: string | null
          org_id?: string
          pagado_el?: string
          proveedor?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payments_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
        ]
      }
      plan_entitlements: {
        Row: {
          clave: string
          plan_id: string
          valor: number
        }
        ComputedFields: never
        Insert: {
          clave: string
          plan_id: string
          valor: number
        }
        Update: {
          clave?: string
          plan_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'plan_entitlements_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      plans: {
        Row: {
          activo: boolean
          app_id: string
          created_at: string
          es_gratuito: boolean
          id: string
          intervalo: string
          nombre: string
          precio_ars: number
        }
        ComputedFields: never
        Insert: {
          activo?: boolean
          app_id: string
          created_at?: string
          es_gratuito?: boolean
          id?: string
          intervalo?: string
          nombre: string
          precio_ars?: number
        }
        Update: {
          activo?: boolean
          app_id?: string
          created_at?: string
          es_gratuito?: boolean
          id?: string
          intervalo?: string
          nombre?: string
          precio_ars?: number
        }
        Relationships: [
          {
            foreignKeyName: 'plans_app_id_fkey'
            columns: ['app_id']
            isOneToOne: false
            referencedRelation: 'apps'
            referencedColumns: ['id']
          },
        ]
      }
      pres_ajustes: {
        Row: {
          forma_pago: string | null
          notas_pie: string | null
          org_id: string
          updated_at: string
          validez_dias: number
        }
        ComputedFields: never
        Insert: {
          forma_pago?: string | null
          notas_pie?: string | null
          org_id: string
          updated_at?: string
          validez_dias?: number
        }
        Update: {
          forma_pago?: string | null
          notas_pie?: string | null
          org_id?: string
          updated_at?: string
          validez_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pres_ajustes_org_id_fkey'
            columns: ['org_id']
            isOneToOne: true
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      pres_clientes: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nombre: string
          notas: string | null
          org_id: string
          telefono: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          org_id: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          org_id?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pres_clientes_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      pres_items: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string
          id: string
          nombre: string
          org_id: string
          precio: number
          unidad: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          activo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          nombre: string
          org_id: string
          precio?: number
          unidad?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string
          id?: string
          nombre?: string
          org_id?: string
          precio?: number
          unidad?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pres_items_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          is_platform_admin: boolean
          nombre: string | null
          updated_at: string
          user_id: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          is_platform_admin?: boolean
          nombre?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_platform_admin?: boolean
          nombre?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          app_id: string
          created_at: string
          estado: Database['public']['Enums']['estado_suscripcion']
          id: string
          org_id: string
          plan_id: string
          proveedor: string
          ref_proveedor: string | null
          updated_at: string
          vence_el: string | null
        }
        ComputedFields: never
        Insert: {
          app_id: string
          created_at?: string
          estado: Database['public']['Enums']['estado_suscripcion']
          id?: string
          org_id: string
          plan_id: string
          proveedor?: string
          ref_proveedor?: string | null
          updated_at?: string
          vence_el?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          estado?: Database['public']['Enums']['estado_suscripcion']
          id?: string
          org_id?: string
          plan_id?: string
          proveedor?: string
          ref_proveedor?: string | null
          updated_at?: string
          vence_el?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_app_id_fkey'
            columns: ['app_id']
            isOneToOne: false
            referencedRelation: 'apps'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'plans'
            referencedColumns: ['id']
          },
        ]
      }
      usage_counters: {
        Row: {
          cantidad: number
          clave: string
          org_id: string
          periodo: string
        }
        ComputedFields: never
        Insert: {
          cantidad?: number
          clave: string
          org_id: string
          periodo: string
        }
        Update: {
          cantidad?: number
          clave?: string
          org_id?: string
          periodo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usage_counters_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _entitlement: { Args: { p_clave: string; p_org: string }; Returns: number }
      _exigir_admin: { Args: Record<PropertyKey, never>; Returns: undefined }
      _registrar_uso: { Args: { p_clave: string; p_org: string }; Returns: number }
      admin_activar_plan: {
        Args: { p_org: string; p_plan: string; p_vence_el: string }
        Returns: string
      }
      admin_cambiar_estado_suscripcion: {
        Args: { p_estado: Database['public']['Enums']['estado_suscripcion']; p_sub: string }
        Returns: undefined
      }
      admin_registrar_pago: {
        Args: {
          p_id_pago_proveedor: string
          p_monto: number
          p_notas?: string
          p_org: string
          p_pagado_el: string
          p_proveedor?: string
        }
        Returns: string
      }
      crear_organizacion: {
        Args: { p_nombre: string; p_rubro?: string; p_telefono?: string }
        Returns: string
      }
      entitlement: { Args: { p_clave: string; p_org: string }; Returns: number }
      es_admin_plataforma: { Args: Record<PropertyKey, never>; Returns: boolean }
      es_miembro: { Args: { p_org: string }; Returns: boolean }
      es_owner: { Args: { p_org: string }; Returns: boolean }
      pres_cargar_ejemplos: { Args: { p_org: string }; Returns: number }
    }
    Enums: {
      estado_app: 'publicada' | 'oculta' | 'retirada'
      estado_suscripcion:
        'prueba' | 'activa' | 'pago_pendiente' | 'en_gracia' | 'suspendida' | 'cancelada'
      rol_org: 'owner' | 'member'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estado_app: ['publicada', 'oculta', 'retirada'],
      estado_suscripcion: [
        'prueba',
        'activa',
        'pago_pendiente',
        'en_gracia',
        'suspendida',
        'cancelada',
      ],
      rol_org: ['owner', 'member'],
    },
  },
} as const
