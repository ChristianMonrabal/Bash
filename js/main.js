class Terminal {
    constructor() {
        this.folders = [];
        this.files = [];
        this.currentPath = "/home";
        this.nanoMode = false;
        this.nanoContent = "";
        this.adminMode = false;
        this.commandHistory = [];
        this.availableCommands = [
            "clear", "mkdir", "ls", "rmdir", "cd", "rename", "note", "nano", "cat", "rm",
            "history", "clearhistory", "pwd", "sudo", "exit", "whoami", "echo", "date",
            "ifconfig", "help", "ping", "background-colour",
        ];
    }

    updatePrompt() {
        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString();

        const promptLine = document.getElementById("cli-prompt-line");
        promptLine.innerHTML = `<span>${currentTime}</span> <span>${this.currentPath}</span> >`     ;
    }

    handleKeyPress(event) {
        if (event.key === "Enter") {
            const commandInput = document.getElementById("commandInput");
            const cliBody = document.getElementById("cli-body");

            const command = commandInput.value.trim().toLowerCase();
            this.executeCommand(command, cliBody);

            commandInput.value = "";
            commandInput.blur();
            setTimeout(() => commandInput.focus(), 0);
        }
    }

    executeCommand(command, cliBody) {
        this.commandHistory.push(command);
        cliBody.innerHTML += `<div>&gt; ${command}</div>`;
        const commandParts = command.split(" ");
        const action = commandParts[0];

        if (this.nanoMode) {
            this.exitNano(command, cliBody);
            return;
        }

        switch (action) {
            case "clear":
                this.clear(cliBody);
                break;
            case "mkdir":
                this.mkdir(commandParts[1], cliBody);
                break;
            case "ls":
                this.ls(cliBody);
                break;
            case "rmdir":
                this.rmdir(commandParts[1], cliBody);
                break;
            case "cd":
                this.cd(commandParts[1], cliBody);
                break;
            case "rename":
                this.rename(commandParts[1], commandParts[2], cliBody);
                break;
            case "note":
                this.note(commandParts[1], cliBody);
                break;
            case "nano":
                this.enterNano(commandParts[1], cliBody);
                break;
            case "cat":
                this.cat(commandParts[1], cliBody);
                break;
            case "rm":
                this.rm(commandParts[1], cliBody);
                break;
            case "history":
                cliBody.innerHTML += `<div>Historial de comandos:</div>`;
                for (const executedCommand of this.commandHistory) {
                    cliBody.innerHTML += `<div>${executedCommand}</div>`;
                }
                break;
            case "clearhistory":
                this.commandHistory = [];
                cliBody.innerHTML += `<div>Historial de comandos borrado.</div>`;
                break;
            case "pwd":
                cliBody.innerHTML += `<div>${this.currentPath}</div>`;
                break;
            case "sudo":
                if (commandParts[1] === "su") {
                    this.enterAdminMode(cliBody);
                } else {
                    cliBody.innerHTML += `<div>Comando no reconocido: ${command}</div>`;
                }
                break;
            case "exit":
                if (this.nanoMode) {
                    this.exitNano(command, cliBody);
                } else if (this.adminMode) {
                    this.exitAdminMode(cliBody);
                }
                break;
            case "whoami":
                cliBody.innerHTML += `<div>Usuario actual: ${this.adminMode ? "admin" : "usuario"}</div>`;
                break;
            case "echo":
                const message = commandParts.slice(1).join(" ");
                cliBody.innerHTML += `<div>${message}</div>`;
                break;
            case "date":
                const currentDate = new Date();
                cliBody.innerHTML += `<div>Fecha y hora actual: ${currentDate.toLocaleString()}</div>`;
                break;
            case "ifconfig":
                this.ifconfig(cliBody);
                break;
            case "ping":
                this.ping(commandParts[1], cliBody);
                break;
            case "help":
                this.showHelp(cliBody);
                break;
            case "colour":
                this.changeTextColor(commandParts[1], cliBody);
                break;
            case "background-colour":
                this.changebackgroundcolour(commandParts[1], cliBody);
                break;                
            default:
                cliBody.innerHTML += `<div>Comando no reconocido: ${command}</div>`;
                break;
        }

        this.updatePrompt();
    }

    clear(cliBody) {
        cliBody.innerHTML = "";
    }

    mkdir(folderName, cliBody) {
        if (!folderName) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de carpeta para mkdir.</div>`;
        } else if (this.folders.includes(folderName)) {
            cliBody.innerHTML += `<div>Error: La carpeta "${folderName}" ya existe.</div>`;
        } else {
            this.folders.push(folderName);
            cliBody.innerHTML += `<div>Carpeta creada: ${folderName}</div>`;
        }
    }

    ls(cliBody) {
        const items = [...this.folders, ...this.files];
        cliBody.innerHTML += `<div>Contenido de ${this.currentPath}: ${items.join(", ")}</div>`;
    }

    rmdir(folderName, cliBody) {
        if (!folderName) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de carpeta para rmdir.</div>`;
        } else if (this.folders.includes(folderName)) {
            this.folders = this.folders.filter(folder => folder !== folderName);
            cliBody.innerHTML += `<div>Carpeta borrada: ${folderName}</div>`;
        } else {
            cliBody.innerHTML += `<div>Error: La carpeta "${folderName}" no existe.</div>`;
        }
    }

    cd(targetPath, cliBody) {
        if (!targetPath) {
            cliBody.innerHTML += `<div>Error: Se requiere una ruta para cd.</div>`;
            return;
        }
    
        let newPath;
    
        // Manejar rutas absolutas
        if (targetPath.startsWith("/")) {
            newPath = targetPath;
        } else {
            // Manejar rutas relativas
            newPath = `${this.currentPath}/${targetPath}`;
        }
    
        // Verificar si la carpeta existe
        if (this.folders.some(folder => folder === newPath)) {
            this.currentPath = newPath;
        } else {
            cliBody.innerHTML += `<div>Error: La carpeta "${targetPath}" no existe.</div>`;
        }
    }
    

    rename(currentName, newName, cliBody) {
        cliBody.innerHTML += `<div>&gt; rename ${currentName} ${newName}</div>`;

        if (!currentName || !newName) {
            cliBody.innerHTML += `<div>Error: Se requieren dos nombres de carpeta para rename.</div>`;
        } else {
            if (this.folders.includes(currentName)) {
                if (this.folders.includes(newName)) {
                    cliBody.innerHTML += `<div>Error: La carpeta "${newName}" ya existe.</div>`;
                } else {
                    this.folders = this.folders.map(folder => (folder === currentName ? newName : folder));
                    cliBody.innerHTML += `<div>Carpeta renombrada: ${currentName} a ${newName}</div>`;
                }
            } else {
                cliBody.innerHTML += `<div>Error: La carpeta "${currentName}" no existe.</div>`;
            }
        }
    }

    note(fileName, cliBody) {
        const commandInput = document.getElementById("commandInput");

        if (!fileName) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de archivo para note.</div>`;
        } else if (!fileName.endsWith(".txt")) {
            cliBody.innerHTML += `<div>Error: Los archivos creados con note deben tener la extensión .txt.</div>`;
        } else if (this.files.includes(fileName)) {
            cliBody.innerHTML += `<div>Error: El archivo "${fileName}" ya existe.</div>`;
        } else {
            this.files.push(fileName);
            this.createFile(fileName);
            cliBody.innerHTML += `<div>Archivo creado: ${fileName}</div>`;
        }
        this.updatePrompt();
        commandInput.value = "";
        setTimeout(() => { commandInput.focus(); }, 0);
    }

    enterNano(fileName, cliBody) {
        if (!fileName) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de archivo para nano.</div>`;
        } else if (!fileName.endsWith(".txt") || !this.files.includes(fileName)) {
            cliBody.innerHTML += `<div>Error: El archivo "${fileName}" no existe o no es un archivo de nota.</div>`;
        } else {
            this.nanoMode = true;
            this.nanoContent = this.readFileContent(fileName);
            cliBody.innerHTML += `<div>Entrando en modo nano. Escribe y luego ejecuta "save" para guardar y "exit" para salir.</div>`;
            cliBody.innerHTML += `<textarea id="nanoTextarea" rows="10" cols="50">${this.nanoContent}</textarea>`;
        }
    }

    exitNano(command, cliBody) {
        if (command === "save") {
            const updatedContent = document.getElementById("nanoTextarea").value;
            const fileName = this.nanoContent;
            this.writeFileContent(fileName, updatedContent);
            cliBody.innerHTML += `<div>Contenido guardado en ${fileName}.</div>`;
        } else if (command === "exit") {
            cliBody.innerHTML += `<div>Saliendo del modo nano.</div>`;
        } else {
            cliBody.innerHTML += `<div>Comando no reconocido en modo nano.</div>`;
        }

        this.nanoMode = false;
        this.nanoContent = "";
    }

    cat(fileName, cliBody) {
        if (!fileName) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de archivo para cat.</div>`;
        } else if (!fileName.endsWith(".txt") || !this.files.includes(fileName)) {
            cliBody.innerHTML += `<div>Error: El archivo "${fileName}" no existe o no es un archivo de nota.</div>`;
        } else {
            const fileContent = this.readFileContent(fileName);
            cliBody.innerHTML += `<div>Contenido de ${fileName}:</div>`;
            cliBody.innerHTML += `<pre>${fileContent}</pre>`;
        }
    }

    rm(name, cliBody) {
        cliBody.innerHTML += `<div>&gt; rm ${name}</div>`;

        if (!name) {
            cliBody.innerHTML += `<div>Error: Se requiere un nombre de carpeta o archivo para rm.</div>`;
        } else {
            const isFolder = this.folders.includes(name);
            const isFile = this.files.includes(name);

            if (isFolder || isFile) {
                if (isFolder) {
                    this.folders = this.folders.filter(folder => folder !== name);
                    cliBody.innerHTML += `<div>Carpeta eliminada: ${name}</div>`;
                }

                if (isFile) {
                    this.files = this.files.filter(file => file !== name);
                    this.deleteFile(name);
                    cliBody.innerHTML += `<div>Archivo eliminado: ${name}</div>`;
                }
            } else {
                cliBody.innerHTML += `<div>Error: El directorio o archivo "${name}" no existe.</div>`;
            }
        }
    }

    readFileContent(fileName) {
        const key = `${this.currentPath}/${fileName}`;
        return localStorage.getItem(key) || "";
    }

    writeFileContent(fileName, content) {
        const key = `${this.currentPath}/${fileName}`;
        localStorage.setItem(key, content);
    }

    deleteFile(fileName) {
        const key = `${this.currentPath}/${fileName}`;
        localStorage.removeItem(key);
    }

    enterAdminMode(cliBody) {
        cliBody.innerHTML += `<div>Ahora eres administrador.</div>`;
        this.adminMode = true;
        this.currentPath = "/admin";
        this.updatePrompt();
    }

    exitAdminMode(cliBody) {
        cliBody.innerHTML += `<div>Saliendo del modo administrador.</div>`;
        this.adminMode = false;
        this.currentPath = "/home";
        this.updatePrompt();
    }

    ifconfig(cliBody) {
        fetch("https://api64.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;
                cliBody.innerHTML += `<div>Dirección IP: ${ip}</div>`;
            })
            .catch(error => {
                console.error("Error al obtener la dirección IP:", error);
                cliBody.innerHTML += `<div>Error al obtener la dirección IP.</div>`;
            });
    }

    ping(host, cliBody) {
        const startTime = Date.now();

        fetch(`https://${host}`)
            .then(() => {
                const endTime = Date.now();
                const duration = endTime - startTime;

                cliBody.innerHTML += `<div>Ping a ${host}: tiempo = ${duration} ms</div>`;
            })
            .catch(() => {
                cliBody.innerHTML += `<div>Error al hacer ping a ${host}</div>`;
            });
    }

    showHelp(cliBody) {
        cliBody.innerHTML += "<div>Comandos disponibles:</div>";
        for (const command of this.availableCommands) {
            cliBody.innerHTML += `<div>${command}</div>`;
        }
    }

    changeTextColor(textColor, cliBody) {
        if (!textColor) {
            cliBody.innerHTML += `<div>Error: Se requiere un color para cambiar el color del texto.</div>`;
            return;
        }
    
        const container = document.querySelector(".cli-container");
        container.style.color = textColor;
    
        cliBody.innerHTML += `<div>Color del texto cambiado a ${textColor}.</div>`;
    }
    
    
    changebackgroundcolour(color, cliBody) {
        if (color) {
            document.documentElement.style.setProperty('--cli-background-color', color);
            this.updatePrompt();
            cliBody.innerHTML += `<div>Color cambiado a ${color}.</div>`;
        } else {
            cliBody.innerHTML += `<div>Error: Especifica un color válido (por ejemplo, "color #ff0000").</div>`;
        }
    }
    
    initialize() {
        document.addEventListener("DOMContentLoaded", () => {
            document.getElementById("commandInput").focus();
            this.updatePrompt();
        });
    }
}

const terminal = new Terminal();
terminal.initialize();
