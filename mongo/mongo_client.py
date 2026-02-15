"""
MongoDB Client - Interface Gráfica com Controle de Permissões
=============================================================
Aplicação desktop que implementa login baseado em roles do MongoDB
e valida permissões antes de executar comandos.

Funcionalidades:
- Login com usuários do MongoDB
- Terminal interativo para comandos MongoDB
- Validação de permissões em tempo real
- Visualização apenas de coleções permitidas
- Controle de acesso a usuários e roles (apenas ADMIN)
"""

import customtkinter as ctk
from tkinter import messagebox, scrolledtext
import pymongo
from pymongo import MongoClient
from pymongo.errors import OperationFailure, ConfigurationError
import re
import json
from typing import Optional, Dict, List, Any


class MongoDBClientApp:
    """Aplicação principal do cliente MongoDB com controle de permissões."""
    
    def __init__(self):
        """Inicializa a aplicação."""
        self.root = ctk.CTk()
        self.root.title("MongoDB Client - Autenticação e Autorização")
        self.root.geometry("1000x700")
        
        # Configurar tema
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Variáveis de estado
        self.client: Optional[MongoClient] = None
        self.db = None
        self.current_user: Optional[str] = None
        self.user_roles: List[str] = []
        self.user_privileges: List[Dict] = []
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
            text="🔐 MongoDB Authentication",
            font=("Arial", 24, "bold")
        )
        title_label.pack(pady=30)
        
        # Subtítulo
        subtitle_label = ctk.CTkLabel(
            login_frame,
            text="Sistema de Controle de Acesso Baseado em Roles",
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
        
        # Configurações de conexão
        config_label = ctk.CTkLabel(
            login_frame,
            text="Host: localhost:27017 | Database: pokeAPI",
            font=("Arial", 10),
            text_color="gray"
        )
        config_label.pack(pady=(20, 5))
        
        # Botão de login
        login_button = ctk.CTkButton(
            login_frame,
            text="Entrar",
            width=300,
            height=40,
            font=("Arial", 14, "bold"),
            command=self.login
        )
        login_button.pack(pady=20)
        
        # Bind Enter key
        self.password_entry.bind("<Return>", lambda e: self.login())
        
        # Informações de usuários de teste
        info_frame = ctk.CTkFrame(login_frame)
        info_frame.pack(pady=20, padx=20, fill="x")
        
        info_title = ctk.CTkLabel(
            info_frame,
            text="👥 Usuários de Teste:",
            font=("Arial", 12, "bold")
        )
        info_title.pack(pady=5)
        
        users_info = [
            "admin / admin (Root completo)",
            "viewer / viewPass123 (Somente leitura)",
            "dataEntry / entryPass123 (Escrita)",
        ]
        
        for user_info in users_info:
            user_label = ctk.CTkLabel(
                info_frame,
                text=user_info,
                font=("Arial", 9),
                text_color="gray"
            )
            user_label.pack()
    
    def login(self):
        """Realiza o login no MongoDB e carrega as permissões do usuário."""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("Erro", "Por favor, preencha usuário e senha!")
            return
        
        try:
            # Tentar conectar ao MongoDB
            connection_string = f"mongodb://{username}:{password}@localhost:27017/pokeAPI?authSource=pokeAPI"
            
            # Tratamento especial para usuário root
            if username == "admin":
                connection_string = f"mongodb://{username}:{password}@localhost:27017/pokeAPI?authSource=admin"
            
            self.client = MongoClient(
                connection_string,
                serverSelectionTimeoutMS=5000
            )
            
            # Testar conexão
            self.client.admin.command('ping')
            
            # Conectar ao banco de dados
            self.db = self.client['pokeAPI']
            
            # Armazenar informações do usuário
            self.current_user = username
            
            # Verificar se é admin root
            if username == "admin":
                self.is_admin = True
                self.user_roles = ["root"]
                self.user_privileges = [{"resource": {"db": "", "collection": ""}, "actions": ["anyAction"]}]
            else:
                # Carregar informações do usuário
                self.load_user_info()
            
            # Mostrar tela principal
            self.show_main_screen()
            
        except OperationFailure as e:
            messagebox.showerror(
                "Erro de Autenticação",
                f"Falha na autenticação:\n{str(e)}"
            )
        except Exception as e:
            messagebox.showerror(
                "Erro de Conexão",
                f"Não foi possível conectar ao MongoDB:\n{str(e)}"
            )
    
    def load_user_info(self):
        """Carrega informações de roles e permissões do usuário atual."""
        try:
            # Usar conexão admin para consultar informações do usuário
            admin_client = MongoClient(
                "mongodb://admin:admin@localhost:27017/",
                authSource="admin",
                serverSelectionTimeoutMS=5000
            )
            
            db_admin = admin_client['pokeAPI']
            
            # Buscar informações do usuário
            user_info = db_admin.command("usersInfo", self.current_user)
            
            if user_info and 'users' in user_info and len(user_info['users']) > 0:
                user_data = user_info['users'][0]
                
                # Extrair roles
                self.user_roles = [role['role'] for role in user_data.get('roles', [])]
                
                # Verificar se é admin
                self.is_admin = 'pokeAdmin' in self.user_roles or 'root' in self.user_roles
                
                # Buscar privilégios de cada role
                self.user_privileges = []
                for role in user_data.get('roles', []):
                    role_info = db_admin.command("rolesInfo", role['role'], showPrivileges=True)
                    if role_info and 'roles' in role_info and len(role_info['roles']) > 0:
                        privileges = role_info['roles'][0].get('privileges', [])
                        self.user_privileges.extend(privileges)
            
            admin_client.close()
            
        except Exception as e:
            print(f"Erro ao carregar informações do usuário: {e}")
            # Em caso de erro, assumir permissões básicas
            self.user_roles = []
            self.user_privileges = []
            self.is_admin = False
    
    def show_main_screen(self):
        """Exibe a tela principal do cliente MongoDB."""
        # Limpar janela
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Frame superior - Informações do usuário
        header_frame = ctk.CTkFrame(self.root, height=80)
        header_frame.pack(fill="x", padx=10, pady=10)
        header_frame.pack_propagate(False)
        
        # Informações do usuário (esquerda)
        user_info_frame = ctk.CTkFrame(header_frame)
        user_info_frame.pack(side="left", fill="both", expand=True, padx=10, pady=10)
        
        user_label = ctk.CTkLabel(
            user_info_frame,
            text=f"👤 Usuário: {self.current_user}",
            font=("Arial", 14, "bold")
        )
        user_label.pack(anchor="w", padx=10, pady=2)
        
        roles_text = ", ".join(self.user_roles) if self.user_roles else "Nenhuma"
        roles_label = ctk.CTkLabel(
            user_info_frame,
            text=f"🔑 Roles: {roles_text}",
            font=("Arial", 11)
        )
        roles_label.pack(anchor="w", padx=10, pady=2)
        
        status_label = ctk.CTkLabel(
            user_info_frame,
            text=f"📊 Banco: pokeAPI | Status: Conectado",
            font=("Arial", 10),
            text_color="green"
        )
        status_label.pack(anchor="w", padx=10, pady=2)
        
        # Botão de logout (direita)
        logout_button = ctk.CTkButton(
            header_frame,
            text="Sair",
            width=100,
            command=self.logout
        )
        logout_button.pack(side="right", padx=10)
        
        # Frame do meio - Coleções disponíveis
        collections_frame = ctk.CTkFrame(self.root, height=150)
        collections_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        collections_label = ctk.CTkLabel(
            collections_frame,
            text="📁 Coleções Disponíveis (com permissão de leitura):",
            font=("Arial", 12, "bold")
        )
        collections_label.pack(anchor="w", padx=10, pady=5)
        
        # Listar coleções com permissão
        collections_text = ctk.CTkTextbox(collections_frame, height=100)
        collections_text.pack(fill="both", padx=10, pady=(0, 5))
        
        self.load_available_collections(collections_text)
        
        # Frame inferior - Terminal
        terminal_frame = ctk.CTkFrame(self.root)
        terminal_frame.pack(fill="both", expand=True, padx=10, pady=(0, 10))
        
        terminal_label = ctk.CTkLabel(
            terminal_frame,
            text="💻 Terminal MongoDB - Digite seus comandos:",
            font=("Arial", 12, "bold")
        )
        terminal_label.pack(anchor="w", padx=10, pady=5)
        
        # Área de output
        self.terminal_output = ctk.CTkTextbox(terminal_frame, height=300)
        self.terminal_output.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Mensagem de boas-vindas
        welcome_msg = f"""
{'='*80}
Bem-vindo ao MongoDB Client, {self.current_user}!
{'='*80}

Você está conectado ao banco 'pokeAPI'.
Suas permissões foram carregadas e serão validadas antes de cada operação.

Comandos disponíveis:
- db.COLLECTION.find()              : Buscar documentos
- db.COLLECTION.find({{"campo": "valor"}})  : Buscar com filtro
- db.COLLECTION.insertOne({{"campo": "valor"}})  : Inserir documento
- db.COLLECTION.updateOne({{}}, {{"$set": {{}}}})  : Atualizar documento
- db.COLLECTION.deleteOne({{"campo": "valor"}})  : Deletar documento
- show collections                  : Listar coleções
- help                              : Mostrar ajuda

{'='*80}
"""
        self.terminal_output.insert("1.0", welcome_msg)
        self.terminal_output.configure(state="disabled")
        
        # Campo de entrada de comando
        command_frame = ctk.CTkFrame(terminal_frame)
        command_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        command_label = ctk.CTkLabel(command_frame, text="Comando:", font=("Arial", 11))
        command_label.pack(side="left", padx=(0, 5))
        
        self.command_entry = ctk.CTkEntry(command_frame, placeholder_text="Ex: db.pokemons.find().limit(5)")
        self.command_entry.pack(side="left", fill="x", expand=True, padx=5)
        
        execute_button = ctk.CTkButton(
            command_frame,
            text="Executar",
            width=100,
            command=self.execute_command
        )
        execute_button.pack(side="right")
        
        # Bind Enter key
        self.command_entry.bind("<Return>", lambda e: self.execute_command())
        
        clear_button = ctk.CTkButton(
            command_frame,
            text="Limpar",
            width=100,
            command=self.clear_terminal
        )
        clear_button.pack(side="right", padx=5)
    
    def load_available_collections(self, textbox):
        """Carrega as coleções que o usuário tem permissão para visualizar."""
        try:
            # Verificar se usuário tem permissão para listar coleções
            if not self.is_admin and not self.can_perform_action("", "listCollections"):
                textbox.insert("1.0", "❌ Você não tem permissão para listar coleções.\n")
                textbox.configure(state="disabled")
                return
            
            collections = self.db.list_collection_names()
            
            if self.is_admin:
                # Admin vê todas as coleções
                textbox.insert("1.0", f"✓ Todas as coleções (Admin): {', '.join(collections)}\n")
            else:
                # Filtrar coleções com base nas permissões
                allowed_collections = []
                
                for collection in collections:
                    if self.can_perform_action(collection, "find"):
                        allowed_collections.append(collection)
                
                if allowed_collections:
                    textbox.insert("1.0", f"✓ Coleções permitidas: {', '.join(allowed_collections)}\n")
                else:
                    textbox.insert("1.0", "⚠ Nenhuma coleção disponível com suas permissões.\n")
        
        except Exception as e:
            textbox.insert("1.0", f"❌ Erro ao listar coleções: {str(e)}\n")
        
        textbox.configure(state="disabled")
    
    def can_perform_action(self, collection: str, action: str) -> bool:
        """Verifica se o usuário pode realizar uma ação em uma coleção."""
        # Admin pode tudo
        if self.is_admin:
            return True
        
        # Verificar privilégios
        for privilege in self.user_privileges:
            resource = privilege.get('resource', {})
            actions = privilege.get('actions', [])
            
            # Verificar se o privilégio se aplica à coleção
            priv_db = resource.get('db', '')
            priv_collection = resource.get('collection', '')
            
            # Privilégio se aplica se:
            # - DB vazio (todas as DBs) ou DB corresponde
            # - Collection vazia (todas as coleções) ou collection corresponde
            if (priv_db == '' or priv_db == 'pokeAPI'):
                if (priv_collection == '' or priv_collection == collection):
                    if action in actions or 'anyAction' in actions:
                        return True
        
        return False
    
    def parse_command(self, command: str) -> Optional[Dict[str, Any]]:
        """
        Faz o parsing do comando MongoDB e extrai informações relevantes.
        
        Retorna um dicionário com:
        - collection: nome da coleção
        - operation: tipo de operação (find, insert, update, delete, etc.)
        - args: argumentos da operação
        """
        # Normalizar comando: remover quebras de linha e espaços extras
        command = command.strip()
        # Substituir quebras de linha e múltiplos espaços por um único espaço
        command = re.sub(r'\s+', ' ', command)
        
        # Comando show collections
        if command.lower() == "show collections":
            return {
                'collection': None,
                'operation': 'listCollections',
                'args': None
            }
        
        # Comando help
        if command.lower() == "help":
            return {
                'collection': None,
                'operation': 'help',
                'args': None
            }
        
        # Comandos especiais db.operationName(args) sem coleção
        # Padrão: db.OPERATION(ARGS) - ex: db.getUsers(), db.getRoles()
        db_command_pattern = r'db\.(\w+)\((.*)\)'
        db_match = re.match(db_command_pattern, command, re.DOTALL)
        
        if db_match:
            operation = db_match.group(1)
            args_str = db_match.group(2).strip()
            
            # Lista de comandos db válidos
            valid_db_commands = [
                'getUsers', 'getRoles', 'getUser', 'getRole',
                'createUser', 'createRole', 'dropUser', 'dropRole',
                'grantRolesToUser', 'revokeRolesFromUser',
                'changeUserPassword', 'updateUser', 'updateRole',
                'stats', 'version', 'serverStatus', 'listCommands',
                'runCommand', 'adminCommand'
            ]
            
            if operation in valid_db_commands:
                return {
                    'collection': None,
                    'operation': operation,
                    'args': args_str,
                    'is_db_command': True
                }
        
        # Padrão: db.COLLECTION.OPERATION(ARGS)
        # Usar DOTALL para capturar conteúdo multi-linha
        pattern = r'db\.(\w+)\.(\w+)\((.*)\)'
        match = re.match(pattern, command, re.DOTALL)
        
        if match:
            collection = match.group(1)
            operation = match.group(2)
            args_str = match.group(3).strip()
            
            return {
                'collection': collection,
                'operation': operation,
                'args': args_str,
                'is_db_command': False
            }
        
        return None
    
    def execute_command(self):
        """Executa o comando inserido pelo usuário após validação de permissões."""
        command = self.command_entry.get().strip()
        
        if not command:
            return
        
        # Adicionar comando ao terminal
        self.append_to_terminal(f"\n> {command}\n", "command")
        
        # Parse do comando
        parsed = self.parse_command(command)
        
        if not parsed:
            self.append_to_terminal("❌ Comando inválido! Use 'help' para ver comandos disponíveis.\n", "error")
            self.command_entry.delete(0, 'end')
            return
        
        # Executar comando especial
        if parsed['operation'] == 'help':
            self.show_help()
            self.command_entry.delete(0, 'end')
            return
        
        if parsed['operation'] == 'listCollections':
            self.list_collections_command()
            self.command_entry.delete(0, 'end')
            return
        
        # Executar comandos db especiais (db.getUsers(), db.getRoles(), etc)
        if parsed.get('is_db_command', False):
            try:
                result = self.execute_db_command(parsed['operation'], parsed['args'])
                self.append_to_terminal(f"✓ Resultado:\n{result}\n", "success")
            except Exception as e:
                self.append_to_terminal(f"❌ Erro ao executar comando: {str(e)}\n", "error")
            self.command_entry.delete(0, 'end')
            return
        
        # Validar permissões para operações em coleções
        collection = parsed['collection']
        operation = parsed['operation']
        
        # Mapear operação para ação do MongoDB
        operation_map = {
            'find': 'find',
            'findOne': 'find',
            'insertOne': 'insert',
            'insertMany': 'insert',
            'updateOne': 'update',
            'updateMany': 'update',
            'deleteOne': 'remove',
            'deleteMany': 'remove',
            'countDocuments': 'find',
            'distinct': 'find'
        }
        
        action = operation_map.get(operation)
        
        if not action:
            self.append_to_terminal(f"❌ Operação '{operation}' não reconhecida!\n", "error")
            self.command_entry.delete(0, 'end')
            return
        
        # Verificar permissão
        if not self.can_perform_action(collection, action):
            self.append_to_terminal(
                f"🚫 ACESSO NEGADO! Você não tem permissão para '{action}' na coleção '{collection}'.\n",
                "error"
            )
            self.command_entry.delete(0, 'end')
            return
        
        # Executar comando
        try:
            result = self.execute_mongo_operation(collection, operation, parsed['args'])
            self.append_to_terminal(f"✓ Resultado:\n{result}\n", "success")
        except Exception as e:
            self.append_to_terminal(f"❌ Erro ao executar comando: {str(e)}\n", "error")
        
        self.command_entry.delete(0, 'end')
    
    def normalize_mongodb_json(self, text: str) -> str:
        """Converte sintaxe MongoDB (campos sem aspas) para JSON válido."""
        # Substituir aspas simples por duplas
        text = text.replace("'", '"')
        
        # Adicionar aspas em identificadores sem aspas (campos de objetos)
        # Padrão: palavra seguida de : mas não entre aspas
        # Exemplo: {name: "value"} -> {"name": "value"}
        # Também: {$inc: {level: 1}} -> {"$inc": {"level": 1}}
        
        import re
        
        # Adicionar aspas em campos de objetos
        # Procura por: início de objeto/array ou vírgula + espaços + palavra + dois-pontos
        # (?<=[{,]): lookbehind para { ou ,
        # \s*: espaços opcionais
        # ([a-zA-Z_$][a-zA-Z0-9_$]*): identificador (incluindo $ para $inc, $set, etc)
        # \s*:: espaços opcionais seguidos de :
        pattern = r'(?<=[{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:'
        text = re.sub(pattern, r' "\1":', text)
        
        # Também no início da string para o primeiro campo
        text = re.sub(r'^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*):', r'\1"\2"\3:', text)
        
        return text
    
    def execute_mongo_operation(self, collection: str, operation: str, args_str: str) -> str:
        """Executa a operação MongoDB real."""
        coll = self.db[collection]
        
        # Parse dos argumentos (JSON)
        args = []
        if args_str:
            try:
                print(f"DEBUG: args_str original: '{args_str[:100]}'")
                
                # Normalizar para JSON válido
                args_str = self.normalize_mongodb_json(args_str)
                print(f"DEBUG: args_str normalizado: '{args_str[:100]}'")
                
                # Usar JSONDecoder para parsear múltiplos objetos JSON
                decoder = json.JSONDecoder()
                idx = 0
                args_str = args_str.strip()
                
                while idx < len(args_str):
                    # Pular espaços em branco e vírgulas
                    while idx < len(args_str) and args_str[idx] in ' \t\n\r,':
                        idx += 1
                    
                    if idx >= len(args_str):
                        break
                    
                    try:
                        # Tentar decodificar um objeto JSON começando na posição idx
                        obj, end_idx = decoder.raw_decode(args_str, idx)
                        args.append(obj)
                        idx = end_idx
                    except json.JSONDecodeError as e:
                        print(f"DEBUG: Erro ao parsear em idx {idx}: {e}")
                        print(f"DEBUG: String restante: '{args_str[idx:idx+50]}'")
                        break
                                
            except Exception as e:
                print(f"DEBUG: Exceção no parsing: {e}")
                import traceback
                traceback.print_exc()
        
        # DEBUG: Mostrar argumentos parseados
        print(f"DEBUG: Argumentos parseados: {len(args)} args")
        for i, arg in enumerate(args):
            print(f"  Arg {i}: {arg}")
        
        # Executar operação
        if operation == 'find':
                # Se falhar no parsing, args ficará vazio
                pass
        
        # Executar operação
        if operation == 'find':
            query = args[0] if args else {}
            cursor = coll.find(query).limit(10)  # Limitar a 10 resultados
            results = list(cursor)
            
            if results:
                # Formatar saída
                output = ""
                for i, doc in enumerate(results, 1):
                    # Converter ObjectId para string
                    doc['_id'] = str(doc['_id'])
                    output += f"\n{i}. {json.dumps(doc, indent=2, ensure_ascii=False)}\n"
                return output + f"\n(Mostrando {len(results)} documentos)"
            else:
                return "Nenhum documento encontrado."
        
        elif operation == 'findOne':
            query = args[0] if args else {}
            result = coll.find_one(query)
            if result:
                result['_id'] = str(result['_id'])
                return json.dumps(result, indent=2, ensure_ascii=False)
            else:
                return "Nenhum documento encontrado."
        
        elif operation == 'insertOne':
            if not args:
                return "❌ Erro: insertOne requer um documento como argumento."
            doc = args[0]
            result = coll.insert_one(doc)
            return f"Documento inserido com sucesso! ID: {result.inserted_id}"
        
        elif operation == 'insertMany':
            if not args:
                return "❌ Erro: insertMany requer um array de documentos."
            docs = args[0]
            if not isinstance(docs, list):
                return "❌ Erro: insertMany requer um array de documentos."
            result = coll.insert_many(docs)
            return f"{len(result.inserted_ids)} documentos inseridos com sucesso!"
        
        elif operation == 'updateOne':
            if len(args) < 2:
                return "❌ Erro: updateOne requer filtro e update."
            result = coll.update_one(args[0], args[1])
            return f"{result.modified_count} documento(s) atualizado(s)."
        
        elif operation == 'updateMany':
            if len(args) < 2:
                return "❌ Erro: updateMany requer filtro e update."
            result = coll.update_many(args[0], args[1])
            return f"{result.modified_count} documento(s) atualizado(s)."
        
        elif operation == 'deleteOne':
            if not args:
                return "❌ Erro: deleteOne requer um filtro."
            result = coll.delete_one(args[0])
            return f"{result.deleted_count} documento(s) deletado(s)."
        
        elif operation == 'deleteMany':
            if not args:
                return "❌ Erro: deleteMany requer um filtro."
            result = coll.delete_many(args[0])
            return f"{result.deleted_count} documento(s) deletado(s)."
        
        elif operation == 'countDocuments':
            query = args[0] if args else {}
            count = coll.count_documents(query)
            return f"Total de documentos: {count}"
        
        else:
            return f"Operação '{operation}' não implementada."
    
    def execute_db_command(self, operation: str, args_str: str) -> str:
        """Executa comandos especiais do db (getUsers, getRoles, etc)."""
        import json
        
        # Parse dos argumentos se houver
        args = {}
        if args_str:
            try:
                # Normalizar para JSON válido
                args_str = self.normalize_mongodb_json(args_str)
                
                # Usar JSONDecoder para parsear
                decoder = json.JSONDecoder()
                args, _ = decoder.raw_decode(args_str.strip())
            except Exception as e:
                print(f"DEBUG: Erro ao parsear argumentos de db.{operation}: {e}")
                args = {}
        
        # Executar comando baseado na operação
        if operation == 'getUsers':
            # Listar usuários do banco atual
            users = self.db.command('usersInfo')
            if 'users' in users:
                output = f"Usuários no banco '{self.db.name}':\n\n"
                for user in users['users']:
                    output += f"👤 {user['user']}\n"
                    output += f"   Database: {user.get('db', 'N/A')}\n"
                    roles_str = ', '.join([f"{r['role']}@{r['db']}" for r in user.get('roles', [])])
                    output += f"   Roles: {roles_str}\n\n"
                return output
            return "Nenhum usuário encontrado."
        
        elif operation == 'getUser':
            # Obter detalhes de um usuário específico
            if not args or 'username' not in args:
                # Tentar parsear string simples
                username = args_str.strip('"\'') if args_str else None
                if not username:
                    return "❌ Erro: getUser requer um nome de usuário."
            else:
                username = args['username']
            
            try:
                user_info = self.db.command('usersInfo', username)
                if 'users' in user_info and user_info['users']:
                    user = user_info['users'][0]
                    output = f"👤 Usuário: {user['user']}\n"
                    output += f"Database: {user.get('db', 'N/A')}\n"
                    output += f"Roles:\n"
                    for role in user.get('roles', []):
                        output += f"  - {role['role']}@{role['db']}\n"
                    return output
                return f"❌ Usuário '{username}' não encontrado."
            except Exception as e:
                return f"❌ Erro ao buscar usuário: {str(e)}"
        
        elif operation == 'getRoles':
            # Listar roles do banco atual
            try:
                roles_info = self.db.command('rolesInfo', 1, showPrivileges=args.get('showPrivileges', False))
                if 'roles' in roles_info:
                    output = f"Roles no banco '{self.db.name}':\n\n"
                    for role in roles_info['roles']:
                        output += f"🔐 {role['role']}\n"
                        output += f"   Database: {role.get('db', 'N/A')}\n"
                        if 'privileges' in role and role['privileges']:
                            output += f"   Privileges: {len(role['privileges'])} privilege(s)\n"
                        if 'roles' in role and role['roles']:
                            inherits_str = ', '.join([f"{r['role']}@{r['db']}" for r in role.get('roles', [])])
                            output += f"   Inherits: {inherits_str}\n"
                        output += "\n"
                    return output
                return "Nenhuma role encontrada."
            except Exception as e:
                return f"❌ Erro ao listar roles: {str(e)}"
        
        elif operation == 'getRole':
            # Obter detalhes de uma role específica
            if not args or 'rolename' not in args:
                # Tentar parsear string simples
                rolename = args_str.strip('"\'') if args_str else None
                if not rolename:
                    return "❌ Erro: getRole requer um nome de role."
            else:
                rolename = args['rolename']
            
            try:
                show_privileges = args.get('showPrivileges', False) if isinstance(args, dict) else False
                role_info = self.db.command('rolesInfo', rolename, showPrivileges=show_privileges)
                if 'roles' in role_info and role_info['roles']:
                    role = role_info['roles'][0]
                    output = f"🔐 Role: {role['role']}\n"
                    output += f"Database: {role.get('db', 'N/A')}\n"
                    
                    if 'privileges' in role and role['privileges']:
                        output += f"\nPrivilégios ({len(role['privileges'])}):\n"
                        for priv in role['privileges']:
                            resource = priv.get('resource', {})
                            actions = priv.get('actions', [])
                            output += f"  - Resource: {resource}\n"
                            output += f"    Actions: {', '.join(actions)}\n"
                    
                    if 'roles' in role and role['roles']:
                        output += f"\nHerda de:\n"
                        for inherited in role['roles']:
                            output += f"  - {inherited['role']}@{inherited['db']}\n"
                    
                    return output
                return f"❌ Role '{rolename}' não encontrada."
            except Exception as e:
                return f"❌ Erro ao buscar role: {str(e)}"
        
        elif operation == 'stats':
            # Estatísticas do banco
            stats = self.db.command('dbStats')
            output = f"📊 Estatísticas do banco '{self.db.name}':\n\n"
            output += f"Coleções: {stats.get('collections', 0)}\n"
            output += f"Documentos: {stats.get('objects', 0)}\n"
            output += f"Tamanho dos dados: {stats.get('dataSize', 0) / (1024*1024):.2f} MB\n"
            output += f"Tamanho do storage: {stats.get('storageSize', 0) / (1024*1024):.2f} MB\n"
            output += f"Índices: {stats.get('indexes', 0)}\n"
            output += f"Tamanho dos índices: {stats.get('indexSize', 0) / (1024*1024):.2f} MB\n"
            return output
        
        elif operation == 'version':
            # Versão do MongoDB
            result = self.db.command('buildInfo')
            return f"MongoDB versão: {result.get('version', 'desconhecida')}"
        
        else:
            return f"❌ Comando db.{operation}() não implementado ou não suportado."
    
    def list_collections_command(self):
        """Lista as coleções disponíveis."""
        try:
            # Verificar se usuário tem permissão para listar coleções
            if not self.is_admin and not self.can_perform_action("", "listCollections"):
                self.append_to_terminal("❌ Você não tem permissão para listar coleções.\n", "error")
                return
            
            collections = self.db.list_collection_names()
            
            if self.is_admin:
                output = f"📁 Todas as coleções ({len(collections)}):\n"
                for coll in collections:
                    count = self.db[coll].count_documents({})
                    output += f"  - {coll} ({count} documentos)\n"
            else:
                allowed = [c for c in collections if self.can_perform_action(c, 'find')]
                output = f"📁 Coleções com permissão de leitura ({len(allowed)}):\n"
                for coll in allowed:
                    count = self.db[coll].count_documents({})
                    output += f"  - {coll} ({count} documentos)\n"
            
            self.append_to_terminal(output, "success")
        except Exception as e:
            self.append_to_terminal(f"❌ Erro ao listar coleções: {str(e)}\n", "error")
    
    def show_help(self):
        """Mostra mensagem de ajuda."""
        help_text = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                           COMANDOS DISPONÍVEIS                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

📖 CONSULTA (SELECT):
   db.COLLECTION.find()                    - Buscar todos (limite 10)
   db.COLLECTION.find({"campo": "valor"})  - Buscar com filtro
   db.COLLECTION.findOne({"campo": "valor"}) - Buscar um documento
   db.COLLECTION.countDocuments({})        - Contar documentos

✏️  INSERÇÃO (INSERT):
   db.COLLECTION.insertOne({"campo": "valor"})  - Inserir um documento
   db.COLLECTION.insertMany([{...}, {...}])     - Inserir múltiplos documentos

🔄 ATUALIZAÇÃO (UPDATE):
   db.COLLECTION.updateOne({"campo": "valor"}, {"$set": {"novo": "valor"}})
   db.COLLECTION.updateMany({filtro}, {"$set": {campos}})

🗑️  REMOÇÃO (DELETE):
   db.COLLECTION.deleteOne({"campo": "valor"})  - Deletar um documento
   db.COLLECTION.deleteMany({"campo": "valor"}) - Deletar múltiplos documentos

🔧 UTILITÁRIOS:
   show collections  - Listar coleções disponíveis
   help              - Mostrar esta ajuda

⚠️  IMPORTANTE:
   - Todas as operações são validadas contra suas permissões
   - Use JSON válido nos argumentos (aspas duplas)
   - Operações bloqueadas retornarão erro de permissão

╚══════════════════════════════════════════════════════════════════════════════╝
"""
        self.append_to_terminal(help_text, "info")
    
    def append_to_terminal(self, text: str, msg_type: str = "normal"):
        """Adiciona texto ao terminal com formatação."""
        self.terminal_output.configure(state="normal")
        self.terminal_output.insert("end", text)
        self.terminal_output.see("end")
        self.terminal_output.configure(state="disabled")
    
    def clear_terminal(self):
        """Limpa o terminal."""
        self.terminal_output.configure(state="normal")
        self.terminal_output.delete("1.0", "end")
        self.terminal_output.configure(state="disabled")
    
    def logout(self):
        """Realiza logout e volta para tela de login."""
        if self.client:
            self.client.close()
        
        self.client = None
        self.db = None
        self.current_user = None
        self.user_roles = []
        self.user_privileges = []
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
