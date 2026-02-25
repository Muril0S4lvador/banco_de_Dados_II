"""
MongoDB Client - Interface Gráfica com Sistema de Permissões Customizado
=======================================================================
Aplicação desktop que implementa sistema de permissões customizado
conforme especificação no arquivo PERMISSION.md

Funcionalidades:
- Login baseado em coleção customizada "users"
- Sistema de roles customizado na coleção "roles"
- Validação de permissões granulares (read, create, delete, update, admin)
- Terminal interativo para comandos MongoDB
- Comando help com todos os comandos disponíveis
"""

import customtkinter as ctk
from tkinter import messagebox,scrolledtext
import pymongo
from pymongo import MongoClient
from pymongo.errors import OperationFailure, ConfigurationError
import re
import json
from typing import Optional, Dict, List, Any


class MongoDBClientApp:
    """Aplicação principal do cliente MongoDB com controle de permissões customizado."""
    
    def __init__(self):
        """Inicializa a aplicação."""
        self.root = ctk.CTk()
        self.root.title("MongoDB Client - Sistema de Permissões Customizado")
        self.root.geometry("1000x700")
        
        # Configurar tema
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Variáveis de estado
        self.client: Optional[MongoClient] = None
        self.db = None
        self.current_user: Optional[str] = None
        self.user_data: Optional[Dict] = None
        self.user_roles_data: List[Dict] = []
        self.is_admin: bool = False
        
        # Mostrar tela de login
        self.show_login_screen()
        
    def show_login_screen(self):
        """Exibe a tela de login."""
        # Limpar janela
        for widget in self.root.winfo_children():
            widget.destroy()
            
        # Frame principal centralizado
        login_frame = ctk.CTkFrame(self.root, width=400, height=500)
        login_frame.place(relx=0.5, rely=0.5, anchor="center")
        
        # Título
        title_label = ctk.CTkLabel(
            login_frame, 
            text="🔐 MongoDB Custom Permissions",
            font=("Arial", 24, "bold")
        )
        title_label.pack(pady=30)
        
        # Subtítulo
        subtitle_label = ctk.CTkLabel(
            login_frame,
            text="Sistema de Controle de Acesso Granular",
            font=("Arial", 12)
        )
        subtitle_label.pack(pady=(0, 30))
        
        # Campo de usuário
        user_label = ctk.CTkLabel(login_frame, text="Usuário:", font=("Arial", 14))
        user_label.pack(pady=(10, 5))
        
        self.username_entry = ctk.CTkEntry(
            login_frame,
            width=300,
            placeholder_text="Digite seu usuário"
        )
        self.username_entry.pack(pady=5)
        
        # Campo de senha
        password_label = ctk.CTkLabel(login_frame, text="Senha:", font=("Arial", 14))
        password_label.pack(pady=(15, 5))
        
        self.password_entry = ctk.CTkEntry(
            login_frame,
            width=300,
            show="*",
            placeholder_text="Digite sua senha"
        )
        self.password_entry.pack(pady=5)
        
        # Botão de login
        login_button = ctk.CTkButton(
            login_frame,
            text="Entrar",
            width=300,
            height=40,
            command=self.login,
            font=("Arial", 14, "bold")
        )
        login_button.pack(pady=30)
        
        # Binding Enter para login
        self.password_entry.bind('<Return>', lambda e: self.login())
        
        # Informações de ajuda
        help_label = ctk.CTkLabel(
            login_frame,
            text="💡 Usuários exemplo:\nadmin/admin (acesso total)\nviewer/viewPass123 (somente leitura)",
            font=("Arial", 10),
            text_color="gray"
        )
        help_label.pack(pady=10)
        
    def login(self):
        """Realiza o login no sistema."""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("Erro", "Por favor, preencha usuário e senha!")
            return
        
        try:
            # Conectar ao MongoDB como admin (conexão de infraestrutura)
            # A autenticação real é feita contra a coleção "users"
            connection_string = "mongodb://admin:admin@localhost:27017/pokeAPI?authSource=admin"
            
            self.client = MongoClient(
                connection_string,
                serverSelectionTimeoutMS=5000
            )
            
            # Testar conexão
            self.client.admin.command('ping')
            
            # Conectar ao banco de dados
            self.db = self.client['pokeAPI']
            
            # Autenticar contra a coleção users
            user = self.db.users.find_one({'username': username})
            
            if not user:
                messagebox.showerror("Erro de Autenticação", "Usuário não encontrado!")
                self.client.close()
                return
            
            # Verificar senha (em produção usar bcrypt)
            if user['password'] != password:
                messagebox.showerror("Erro de Autenticação", "Senha incorreta!")
                self.client.close()
                return
            
            # Verificar se usuário está ativo
            if not user.get('active', True):
                messagebox.showerror("Erro de Autenticação", "Usuário desativado!")
                self.client.close()
                return
            
            # Armazenar informações do usuário
            self.current_user = username
            self.user_data = user
            
            # Carregar roles do usuário
            self.load_user_roles()
            
            # Mostrar tela principal
            self.show_main_screen()
            
        except Exception as e:
            messagebox.showerror(
                "Erro de Conexão",
                f"Não foi possível conectar ao MongoDB:\n{str(e)}"
            )
    
    def load_user_roles(self):
        """Carrega as roles do usuário e verifica se é admin."""
        try:
            user_role_names = self.user_data.get('roles', [])
            
            # Buscar dados completos das roles
            self.user_roles_data = list(self.db.roles.find({'roleName': {'$in': user_role_names}}))
            
            # Verificar se alguma role tem admin=true (True Override)
            self.is_admin = any(role.get('admin', False) for role in self.user_roles_data)
            
        except Exception as e:
            print(f"Erro ao carregar roles: {e}")
            self.user_roles_data = []
            self.is_admin = False
    
    def can_perform_action(self, collection: str, permission_type: str) -> bool:
        """
        Verifica se o usuário pode realizar uma ação em uma coleção.
        
        Args:
            collection: Nome da coleção
            permission_type: Tipo de permissão (read, create, delete, update, admin)
        
        Returns:
            True se o usuário tem permissão, False caso contrário
        
        Regras:
        - Admin = True: acesso pleno a tudo
        - Default Deny: sem permissão explícita = negado
        - True Override: qualquer role com permissão = autorizado
        - Coleções "users" e "roles": somente admin
        """
        # Restrição de metadados: users e roles somente para admin
        if collection in ['users', 'roles']:
            return self.is_admin
        
        # Admin tem acesso pleno
        if self.is_admin:
            return True
        
        # True Override: percorrer todas as roles
        for role in self.user_roles_data:
            permissions = role.get('permissions', [])
            
            for perm in permissions:
                # Verificar se é a tabela correta
                if perm.get('tableName') == collection:
                    # Verificar se tem a permissão específica
                    if perm.get(permission_type, False):
                        return True
        
        # Default Deny
        return False
    
    def map_operation_to_permission(self, operation: str) -> str:
        """
        Mapeia operações MongoDB para tipos de permissão.
        
        Read: find, findOne, countDocuments, distinct
        Create: insertOne, insertMany
        Update: updateOne, updateMany, replaceOne
        Delete: deleteOne, deleteMany, findOneAndDelete
        Admin: createCollection, drop, createIndex, getIndexes
        """
        operation_map = {
            # Read operations
            'find': 'read',
            'findOne': 'read',
            'countDocuments': 'read',
            'distinct': 'read',
            'count': 'read',
            
            # Create operations
            'insertOne': 'create',
            'insertMany': 'create',
            'insert': 'create',
            
            # Update operations
            'updateOne': 'update',
            'updateMany': 'update',
            'replaceOne': 'update',
            'update': 'update',
            'findOneAndUpdate': 'update',
            
            # Delete operations
            'deleteOne': 'delete',
            'deleteMany': 'delete',
            'remove': 'delete',
            'findOneAndDelete': 'delete',
            
            # Admin operations
            'createCollection': 'admin',
            'drop': 'admin',
            'createIndex': 'admin',
            'getIndexes': 'admin',
            'dropIndex': 'admin',
            'stats': 'admin',
            'collStats': 'read',  # Estatísticas de coleção podem ser read
        }
        
        return operation_map.get(operation, 'admin')  # Default: admin
    
    def show_main_screen(self):
        """Exibe a tela principal do cliente MongoDB."""
        # Limpar janela
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Frame superior - Informações do usuário
        header_frame = ctk.CTkFrame(self.root, height=80)
        header_frame.pack(fill="x", padx=10, pady=10)
        
        # Informações do usuário
        user_info = f"👤 Usuário: {self.current_user}"
        if self.is_admin:
            user_info += " [ADMIN]"
        
        user_label = ctk.CTkLabel(
            header_frame,
            text=user_info,
            font=("Arial", 16, "bold")
        )
        user_label.pack(side="left", padx=20, pady=10)
        
        # Roles do usuário
        roles_text = "Roles: " + ", ".join([role['roleName'] for role in self.user_roles_data])
        roles_label = ctk.CTkLabel(
            header_frame,
            text=roles_text,
            font=("Arial", 12)
        )
        roles_label.pack(side="left", padx=10)
        
        # Botão de logout
        logout_button = ctk.CTkButton(
            header_frame,
            text="Sair",
            width=100,
            command=self.logout
        )
        logout_button.pack(side="right", padx=20)
        
        # Frame do meio - Coleções disponíveis
        collections_frame = ctk.CTkFrame(self.root, height=100)
        collections_frame.pack(fill="x", padx=10, pady=5)
        
        collections_label = ctk.CTkLabel(
            collections_frame,
            text="📚 Coleções Disponíveis:",
            font=("Arial", 14, "bold")
        )
        collections_label.pack(pady=10, anchor="w", padx=20)
        
        # Textbox para mostrar coleções
        self.collections_textbox = ctk.CTkTextbox(
            collections_frame,
            height=60,
            font=("Courier New", 11),
            state="normal"
        )
        self.collections_textbox.pack(fill="x", padx=20, pady=(0, 10))
        
        # Carregar coleções
        self.load_available_collections(self.collections_textbox)
        
        # Frame principal - Terminal
        terminal_frame = ctk.CTkFrame(self.root)
        terminal_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Terminal label e help button
        terminal_header = ctk.CTkFrame(terminal_frame)
        terminal_header.pack(fill="x", padx=10, pady=5)
        
        terminal_label = ctk.CTkLabel(
            terminal_header,
            text="🖥️ Terminal MongoDB:",
            font=("Arial", 14, "bold")
        )
        terminal_label.pack(side="left")
        
        help_button = ctk.CTkButton(
            terminal_header,
            text="help",
            width=80,
            command=self.show_help
        )
        help_button.pack(side="right", padx=5)
        
        # Terminal de saída
        self.output_terminal = ctk.CTkTextbox(
            terminal_frame,
            font=("Courier New", 11),
            state="disabled"
        )
        self.output_terminal.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Mensagem de boas-vindas
        welcome_msg = f"Bem-vindo, {self.current_user}!\nDigite 'help' para ver os comandos disponíveis.\n\n"
        self.output_terminal.configure(state="normal")
        self.output_terminal.insert("1.0", welcome_msg)
        self.output_terminal.configure(state="disabled")
        
        # Frame de entrada de comando
        command_frame = ctk.CTkFrame(terminal_frame)
        command_frame.pack(fill="x", padx=10, pady=5)
        
        command_label = ctk.CTkLabel(
            command_frame,
            text="Comando:",
            font=("Arial", 12)
        )
        command_label.pack(side="left", padx=5)
        
        self.command_entry = ctk.CTkEntry(
            command_frame,
            placeholder_text="Digite seu comando MongoDB aqui (ex: db.pokemons.find())"
        )
        self.command_entry.pack(side="left", fill="x", expand=True, padx=5)
        self.command_entry.bind('<Return>', lambda e: self.execute_command())
        
        execute_button = ctk.CTkButton(
            command_frame,
            text="Executar",
            width=100,
            command=self.execute_command
        )
        execute_button.pack(side="right", padx=5)
        
        clear_button = ctk.CTkButton(
            command_frame,
            text="Limpar",
            width=80,
            command=self.clear_terminal
        )
        clear_button.pack(side="right")
    
    def show_help(self):
        """Exibe o painel de ajuda com todos os comandos disponíveis."""
        help_text = """
╔════════════════════════════════════════════════════════════════╗
║              COMANDOS DISPONÍVEIS - MongoDB Client             ║
╠════════════════════════════════════════════════════════════════╣

📖 COMANDOS DE LEITURA (Read):
   db.COLLECTION.find()                    - Buscar todos os documentos
   db.COLLECTION.find({"campo": "valor"})  - Buscar com filtro
   db.COLLECTION.findOne({"campo": "valor"})- Buscar um documento
   db.COLLECTION.countDocuments()          - Contar documentos
   db.COLLECTION.countDocuments({"campo": "valor"}) - Contar com filtro
   db.COLLECTION.distinct("campo")         - Valores únicos de um campo

✍️ COMANDOS DE CRIAÇÃO (Create):
   db.COLLECTION.insertOne({"campo": "valor"})  - Inserir um documento
   db.COLLECTION.insertMany([{...}, {...}])     - Inserir vários documentos

🔄 COMANDOS DE ATUALIZAÇÃO (Update):
   db.COLLECTION.updateOne({}, {"$set": {}})    - Atualizar um documento
   db.COLLECTION.updateMany({}, {"$set": {}})   - Atualizar vários documentos
   db.COLLECTION.replaceOne({}, {...})          - Substituir um documento

❌ COMANDOS DE REMOÇÃO (Delete):
   db.COLLECTION.deleteOne({"campo": "valor"})  - Deletar um documento
   db.COLLECTION.deleteMany({"campo": "valor"}) - Deletar vários documentos
   db.COLLECTION.findOneAndDelete({...})        - Buscar e deletar

🔧 COMANDOS ADMINISTRATIVOS (Admin):
   db.createCollection("nome")             - Criar coleção
   db.COLLECTION.drop()                    - Remover coleção
   db.COLLECTION.createIndex({})           - Criar índice
   db.COLLECTION.getIndexes()              - Listar índices

🌐 COMANDOS GERAIS (Todos os usuários):
   show collections                        - Listar coleções
   help                                    - Mostrar esta ajuda
   exit                                    - Sair da aplicação

╠════════════════════════════════════════════════════════════════╣
║ 💡 Dicas:                                                      ║
║  - Substitua COLLECTION pelo nome da coleção (ex: pokemons)   ║
║  - Use JSON válido nos argumentos                             ║
║  - Suas permissões são validadas antes de executar comandos   ║
╚════════════════════════════════════════════════════════════════╝
"""
        
        self.output_terminal.configure(state="normal")
        self.output_terminal.delete("1.0", "end")
        self.output_terminal.insert("1.0", help_text)
        self.output_terminal.configure(state="disabled")
    
    def load_available_collections(self, textbox):
        """Carrega as coleções que o usuário tem permissão para visualizar."""
        try:
            textbox.configure(state="normal")
            textbox.delete("1.0", "end")
            
            collections = self.db.list_collection_names()
            
            # Filtrar coleções baseado em permissões
            allowed_collections = []
            
            for collection in collections:
                # Verificar se pode ao menos ler a coleção
                if self.can_perform_action(collection, 'read') or self.is_admin:
                    allowed_collections.append(collection)
            
            if allowed_collections:
                textbox.insert("1.0", f"✓ Coleções acessíveis: {', '.join(allowed_collections)}")
            else:
                textbox.insert("1.0", "⚠ Nenhuma coleção acessível com suas permissões.")
            
            textbox.configure(state="disabled")
        
        except Exception as e:
            textbox.configure(state="normal")
            textbox.insert("1.0", f"❌ Erro ao listar coleções: {str(e)}")
            textbox.configure(state="disabled")
    
    def split_arguments(self, args_str: str) -> List[str]:
        """
        Divide a string de argumentos por vírgula, respeitando chaves e colchetes.
        Exemplo: "{a:1}, {b:2}" -> ["{a:1}", "{b:2}"]
        """
        if not args_str:
            return []
        
        args = []
        current_arg = []
        depth = 0
        in_string = False
        string_char = None
        
        for i, char in enumerate(args_str):
            # Gerenciar strings
            if char in ['"', "'"] and (i == 0 or args_str[i-1] != '\\'):
                if not in_string:
                    in_string = True
                    string_char = char
                elif char == string_char:
                    in_string = False
                    string_char = None
            
            # Se estiver dentro de string, adicionar o caractere sem processar
            if in_string:
                current_arg.append(char)
                continue
            
            # Gerenciar profundidade de chaves/colchetes
            if char in ['{', '[']:
                depth += 1
            elif char in ['}', ']']:
                depth -= 1
            
            # Separar por vírgula apenas no nível superior
            if char == ',' and depth == 0:
                arg = ''.join(current_arg).strip()
                if arg:
                    args.append(arg)
                current_arg = []
            else:
                current_arg.append(char)
        
        # Adicionar último argumento
        arg = ''.join(current_arg).strip()
        if arg:
            args.append(arg)
        
        return args
    
    def parse_command(self, command: str) -> Optional[Dict[str, Any]]:
        """
        Faz o parsing do comando MongoDB.
        
        Retorna dict com:
        - collection: nome da coleção
        - operation: tipo de operação
        - args: argumentos da operação
        """
        command = command.strip()
        command = re.sub(r'\s+', ' ', command)
        
        # Comandos especiais
        if command.lower() == "show collections":
            return {'collection': None, 'operation': 'listCollections', 'args': None}
        
        if command.lower() in ["help", "exit"]:
            return {'collection': None, 'operation': command.lower(), 'args': None}
        
        # Padrão 1: db.operation(args) - Comandos administrativos de banco
        # Exemplo: db.createCollection("nome")
        db_pattern = r'^db\.(\w+)\((.*)\)$'
        db_match = re.match(db_pattern, command)
        
        if db_match:
            operation = db_match.group(1)
            args_str = db_match.group(2).strip()
            
            # Parsear argumentos
            args = None
            if args_str:
                # Separar múltiplos argumentos
                arg_list = self.split_arguments(args_str)
                
                if len(arg_list) == 0:
                    args = None
                elif len(arg_list) == 1:
                    # Um único argumento
                    try:
                        args_str_normalized = self.normalize_mongodb_json(arg_list[0])
                        args = json.loads(args_str_normalized)
                    except json.JSONDecodeError:
                        # Se não for JSON, pode ser uma string simples entre aspas
                        if arg_list[0].startswith('"') and arg_list[0].endswith('"'):
                            args = arg_list[0].strip('"')
                        elif arg_list[0].startswith("'") and arg_list[0].endswith("'"):
                            args = arg_list[0].strip("'")
                        else:
                            args = arg_list[0]
                else:
                    # Múltiplos argumentos - parsear cada um
                    parsed_args = []
                    for arg in arg_list:
                        try:
                            arg_normalized = self.normalize_mongodb_json(arg)
                            parsed_args.append(json.loads(arg_normalized))
                        except json.JSONDecodeError:
                            # String simples
                            if arg.startswith('"') and arg.endswith('"'):
                                parsed_args.append(arg.strip('"'))
                            elif arg.startswith("'") and arg.endswith("'"):
                                parsed_args.append(arg.strip("'"))
                            else:
                                parsed_args.append(arg)
                    args = parsed_args
            
            return {
                'collection': None,  # Comandos de banco não têm coleção específica
                'operation': operation,
                'args': args,
                'is_db_command': True
            }
        
        # Padrão 2: db.collection.operation(args)
        pattern = r'db\.(\w+)\.(\w+)\((.*)\)$'
        match = re.match(pattern, command)
        
        if not match:
            return None
        
        collection = match.group(1)
        operation = match.group(2)
        args_str = match.group(3).strip()
        
        # Parsear argumentos
        args = None
        if args_str:
            # Separar múltiplos argumentos
            arg_list = self.split_arguments(args_str)
            
            if len(arg_list) == 0:
                args = None
            elif len(arg_list) == 1:
                # Um único argumento
                try:
                    args_str_normalized = self.normalize_mongodb_json(arg_list[0])
                    args = json.loads(args_str_normalized)
                except json.JSONDecodeError:
                    args = arg_list[0]
            else:
                # Múltiplos argumentos - parsear cada um
                parsed_args = []
                for arg in arg_list:
                    try:
                        arg_normalized = self.normalize_mongodb_json(arg)
                        parsed_args.append(json.loads(arg_normalized))
                    except json.JSONDecodeError:
                        parsed_args.append(arg)
                args = parsed_args
        
        return {
            'collection': collection,
            'operation': operation,
            'args': args,
            'is_db_command': False
        }
    
    def normalize_mongodb_json(self, json_str: str) -> str:
        """Normaliza JSON do MongoDB para JSON válido."""
        # Adicionar aspas em chaves sem aspas (incluindo operadores $ do MongoDB)
        # Suporta chaves como: name, $set, $push, _id, etc.
        json_str = re.sub(r'([\$\w]+):', r'"\1":', json_str)
        return json_str
    
    def execute_command(self):
        """Executa o comando digitado pelo usuário."""
        command = self.command_entry.get().strip()
        
        if not command:
            return
        
        # Limpar campo de entrada
        self.command_entry.delete(0, 'end')
        
        # Adicionar comando ao terminal
        self.output_terminal.configure(state="normal")
        self.output_terminal.insert("end", f"\n> {command}\n")
        self.output_terminal.configure(state="disabled")
        
        # Parsear comando
        parsed = self.parse_command(command)
        
        if not parsed:
            self.write_output("❌ Comando inválido. Digite 'help' para ver comandos disponíveis.\n")
            return
        
        # Executar comando
        try:
            if parsed['operation'] == 'help':
                self.show_help()
                return
            
            if parsed['operation'] == 'exit':
                self.logout()
                return
            
            if parsed['operation'] == 'listCollections':
                self.execute_list_collections()
                return
            
            # Verificar se é comando de banco (db.operation)
            if parsed.get('is_db_command', False):
                self.execute_db_command(parsed['operation'], parsed['args'])
                return
            
            # Comandos em coleções
            collection = parsed['collection']
            operation = parsed['operation']
            args = parsed['args']
            
            # Verificar permissão
            perm_type = self.map_operation_to_permission(operation)
            
            if not self.can_perform_action(collection, perm_type):
                self.write_output(f"❌ PERMISSÃO NEGADA: Você não tem permissão '{perm_type}' na coleção '{collection}'.\n")
                return
            
            # Executar operação
            self.execute_collection_operation(collection, operation, args)
        
        except Exception as e:
            self.write_output(f"❌ Erro ao executar comando: {str(e)}\n")
    
    def execute_list_collections(self):
        """Executa o comando show collections."""
        try:
            collections = self.db.list_collection_names()
            
            allowed_collections = []
            for col in collections:
                if self.can_perform_action(col, 'read') or self.is_admin:
                    allowed_collections.append(col)
            
            if allowed_collections:
                output = "📚 Coleções acessíveis:\n"
                for col in allowed_collections:
                    output += f"  - {col}\n"
            else:
                output = "⚠ Nenhuma coleção acessível.\n"
            
            self.write_output(output)
        
        except Exception as e:
            self.write_output(f"❌ Erro: {str(e)}\n")
    
    def execute_db_command(self, operation: str, args):
        """
        Executa comandos de banco (db.operation).
        
        Comandos administrativos como db.createCollection() requerem permissão admin.
        """
        try:
            # Verificar se é admin (comandos de banco requerem permissão admin)
            if not self.is_admin:
                self.write_output(f"❌ PERMISSÃO NEGADA: Comandos administrativos de banco requerem permissão admin.\n")
                return
            
            # db.createCollection("nome")
            if operation == 'createCollection':
                if not args:
                    self.write_output("❌ Erro: db.createCollection requer nome da coleção como argumento.\n")
                    return
                
                collection_name = args if isinstance(args, str) else str(args)
                self.db.create_collection(collection_name)
                self.write_output(f"✓ Coleção '{collection_name}' criada com sucesso!\n")
                
                # Atualizar lista de coleções
                self.load_available_collections(self.collections_textbox)
            
            else:
                self.write_output(f"❌ Comando de banco '{operation}' não implementado.\n")
        
        except Exception as e:
            self.write_output(f"❌ Erro ao executar comando de banco: {str(e)}\n")
            
            self.write_output(output)
        
        except Exception as e:
            self.write_output(f"❌ Erro: {str(e)}\n")
    
    def execute_collection_operation(self, collection: str, operation: str, args):
        """Executa uma operação em uma coleção."""
        try:
            coll = self.db[collection]
            result = None
            
            # Operações de leitura
            if operation == 'find':
                filter_doc = args if args else {}
                cursor = coll.find(filter_doc).limit(20)
                docs = list(cursor)
                result = f"Encontrados {len(docs)} documentos (limite: 20):\n"
                for doc in docs:
                    result += json.dumps(doc, indent=2, default=str) + "\n"
            
            elif operation == 'findOne':
                filter_doc = args if args else {}
                doc = coll.find_one(filter_doc)
                result = json.dumps(doc, indent=2, default=str) if doc else "Nenhum documento encontrado"
            
            elif operation == 'countDocuments':
                filter_doc = args if args else {}
                count = coll.count_documents(filter_doc)
                result = f"Total de documentos: {count}"
            
            elif operation == 'distinct':
                field = args
                values = coll.distinct(field)
                result = f"Valores únicos de '{field}': {values}"
            
            # Operações de criação
            elif operation == 'insertOne':
                res = coll.insert_one(args)
                result = f"✓ Documento inserido com _id: {res.inserted_id}"
            
            elif operation == 'insertMany':
                res = coll.insert_many(args)
                result = f"✓ {len(res.inserted_ids)} documentos inseridos"
            
            # Operações de atualização
            elif operation == 'updateOne':
                if isinstance(args, list) and len(args) >= 2:
                    filter_doc = args[0]
                    update_doc = args[1]
                    res = coll.update_one(filter_doc, update_doc)
                    result = f"✓ Documentos correspondentes: {res.matched_count}, Modificados: {res.modified_count}"
                else:
                    result = "❌ updateOne requer [filtro, atualização]"
            
            elif operation == 'updateMany':
                if isinstance(args, list) and len(args) >= 2:
                    filter_doc = args[0]
                    update_doc = args[1]
                    res = coll.update_many(filter_doc, update_doc)
                    result = f"✓ Documentos correspondentes: {res.matched_count}, Modificados: {res.modified_count}"
                else:
                    result = "❌ updateMany requer [filtro, atualização]"
            
            elif operation == 'replaceOne':
                if isinstance(args, list) and len(args) >= 2:
                    filter_doc = args[0]
                    replacement = args[1]
                    res = coll.replace_one(filter_doc, replacement)
                    result = f"✓ Documentos correspondentes: {res.matched_count}, Modificados: {res.modified_count}"
                else:
                    result = "❌ replaceOne requer [filtro, documento_novo]"
            
            # Operações de remoção
            elif operation == 'deleteOne':
                filter_doc = args if args else {}
                res = coll.delete_one(filter_doc)
                result = f"✓ Documentos deletados: {res.deleted_count}"
            
            elif operation == 'deleteMany':
                filter_doc = args if args else {}
                res = coll.delete_many(filter_doc)
                result = f"✓ Documentos deletados: {res.deleted_count}"
            
            elif operation == 'findOneAndDelete':
                filter_doc = args if args else {}
                doc = coll.find_one_and_delete(filter_doc)
                if doc:
                    result = f"✓ Documento deletado:\n{json.dumps(doc, indent=2, default=str)}"
                else:
                    result = "Nenhum documento encontrado para deletar"
            
            # Operações administrativas
            elif operation == 'drop':
                coll.drop()
                result = f"✓ Coleção '{collection}' removida"
                
                # Expurgo em Drop: Remover permissões da coleção de todas as roles
                try:
                    update_result = self.db.roles.update_many(
                        {},
                        {'$pull': {'permissions': {'tableName': collection}}}
                    )
                    if update_result.modified_count > 0:
                        result += f"\n✓ Permissões removidas de {update_result.modified_count} role(s)"
                except Exception as e:
                    result += f"\n⚠ Aviso: Não foi possível remover permissões das roles: {str(e)}"
                
                # Atualizar lista de coleções
                self.load_available_collections(self.collections_textbox)
            
            elif operation == 'createIndex':
                res = coll.create_index(args)
                result = f"✓ Índice criado: {res}"
            
            elif operation == 'getIndexes':
                indexes = list(coll.list_indexes())
                result = "Índices:\n" + json.dumps(indexes, indent=2, default=str)
            
            else:
                result = f"❌ Operação '{operation}' não implementada"
            
            self.write_output(result + "\n")
        
        except Exception as e:
            self.write_output(f"❌ Erro ao executar operação: {str(e)}\n")
    
    def write_output(self, text: str):
        """Escreve texto no terminal de saída."""
        self.output_terminal.configure(state="normal")
        self.output_terminal.insert("end", text)
        self.output_terminal.see("end")
        self.output_terminal.configure(state="disabled")
    
    def clear_terminal(self):
        """Limpa o terminal de saída."""
        self.output_terminal.configure(state="normal")
        self.output_terminal.delete("1.0", "end")
        self.output_terminal.insert("1.0", f"Terminal limpo. Digite 'help' para ver comandos disponíveis.\n\n")
        self.output_terminal.configure(state="disabled")
    
    def logout(self):
        """Faz logout e volta para a tela de login."""
        if self.client:
            self.client.close()
        
        self.current_user = None
        self.user_data = None
        self.user_roles_data = []
        self.is_admin = False
        
        self.show_login_screen()
    
    def run(self):
        """Inicia a aplicação."""
        self.root.mainloop()


def main():
    """Função principal."""
    app = MongoDBClientApp()
    app.run()


if __name__ == "__main__":
    main()
