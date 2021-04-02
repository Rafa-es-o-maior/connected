import { PriorityEvent } from "./event.js";


class FileSource
{
    constructor(filePath, root)
    {
        this.filePath = filePath;
        this.root = root;
    }

    async import()
    {
        return await import((this.root + "/" + this.filePath).replace("//", "/"));
    }
}
class SourceProvider
{
    async getFiles()
    {
        throw new Error("Not Implemented")
    }
}

class FileSourceProvider extends SourceProvider
{
    constructor(file)
    {
        super();
        this.file = file;
    }

    async getFiles()
    {
        let response = await fetch(this.file);

        let root = this.file.split("/");
        root.length--;
        root = root.join("/");

        let source = new TextSourceProvider(await response.text(), root);
        let files = await source.getFiles();

        for(let file of files)
        {
            file.filePath = file.filePath;
        }

        return files;
    }
}

class TextSourceProvider extends SourceProvider
{
    constructor(text, root)
    {
        super();
        this.text = text;
        this.root = root;
    }

    async getFiles()
    {
        let source = new ArraySourceProvider(this.text.replace(/\r/g, "").split("\n"), this.root);
        return await source.getFiles();
    }
}

class ArraySourceProvider extends SourceProvider
{
    constructor(arr, root)
    {
        super();
        this.arr = arr;
        this.root = root;
    }

    async getFiles()
    {
        return this.arr.map((value)=>new FileSource(value, this.root));
    }
}

class Loader
{
    constructor(owner)
    {
        this.finished = {};
        this.listeners = [];

        this.queued = [];
        this.owner = owner;

        this.paths = [];
    }

    buildProxy(paths)
    {
        return new Proxy({}, {
            get: (target, name)=>
            {
                for(let i = 0; i < paths.length; i++)
                {
                    let value = this.finished[paths[i]][name];
        
                    if(value !== undefined)
                    {
                        return value;
                    }
                }
            },

            set: (target, name, value)=>
            {
                for(let i = 0; i < paths.length; i++)
                {
                    let o = this.finished[paths[i]][name];
        
                    if(o !== undefined)
                    {
                        this.finished[paths[i]][name] = value;
                        break;
                    }
                }
            },
        })
    }

    isFinished(paths)
    {
        for(let i = 0; i < paths.length; i++)
        {
            let container = this.finished[paths[i]];

            if(container === undefined)
            {
                return false;
            }
        }

        return true;
    }

    load(path, callback) {
        if(typeof path === "string")
        {
            path = [path];
        }

        if(this.isFinished(path))
        {
            // already loaded, call it
            console.log("calling callback " + callback.name + " from already loaded");
            callback(this.buildProxy(path));
        }
        else
        {
            this.listeners.push({paths: path, callback})
        }
    }

    loaded(path, container)
    {
        this.finished[path] = container;

        for(let i = 0; i < this.listeners.length; i++)
        {
            let callback = this.listeners[i];

            if(this.isFinished(callback.paths))
            {
                console.log("calling callback " + callback.callback.name + " from load");
                this.listeners.splice(i--, 1);
                callback.callback(this.buildProxy(callback.paths));
            }
        }
    }

    queueFile(path, under)
    {
        this.queued.push({source: new FileSourceProvider(path), under});
        return this;
    }

    queueText(text, root, under)
    {
        this.queued.push({source: new TextSourceProvider(text, root), under});
        return this;
    }

    queuePaths(paths, root, under)
    {
        this.queued.push({source: new ArraySourceProvider(paths, root), under});
        return this;
    }

    async start()
    {
        await this.resolveProviders();
        await this.loadPaths();
    }

    async resolveProviders()
    {
        while(this.queued.length > 0)
        {
            let queued = this.queued.shift();

            this.paths.push(...(await queued.source.getFiles()).map((value)=>{return {path: value, under: queued.under}}));
        }

        this.transformed = this.paths.map((value)=>transformPath(value.under, value.path.filePath));
    }

    async loadPaths()
    {
        for(let i = 0; i < this.paths.length; i++)
        {
            await this.importModule(this.paths[i].path, this.paths[i].under);
        }
    }

    async importModule(path, under)
    {
        let module = await path.import();

        let transformed = transformPath(under, path.filePath);

        let requirements = module.requiring || [];

        let b = transformed.split(".");

        while(b.length > 0)
        {
            b.length -= 1;

            let joined = b.join(".");

            if(this.transformed.includes(joined))
            {
                requirements.push(joined);
            }
        }

        if(this.isFinished(requirements))
        {
            this.loadModule(module, transformed);
        }
        else
        {
            this.load(requirements, this.loadModule.bind(this, module, transformed))
        }
    }

    loadModule(module, transformed)
    {
        let isNew = false;
        let container = getPath(this.owner, transformed);

        if(container === undefined)
        {
            isNew = true;
            container = {};
        }

        if(module.setup === undefined)
        {
            merge(container, module);
        }
        else
        {
            module.setup(this.owner, container);
        }


        if(isNew && Object.keys(container).length > 0)
        {
            generatePath(this.owner, transformed.split("."), container);
        }

        this.loaded(transformed, container);
    }
}

function merge(self, other)
{
    for (let [key, value] of Object.entries(other))
    {
        if((typeof value) === "object")
        {
            if(self[key] === undefined)
            {
                self[key] = {};
            }

            merge(self[key], value);
        }
        else
        {
            if(self[key] !== undefined)
            {
                throw new Error("Could not merge at key " + key);
            }

            self[key] = value;
        }
    }
}

function transformPath(...paths)
{
    let final = [];
    for(let path of paths)
    {
        if(path.startsWith("/"))
        {
            path = path.substring(1);
        }
        
        path = path.split("/");

        if(path[path.length - 1].endsWith(".js"))
        {
            path[path.length - 1] = path[path.length - 1].substring(0, path[path.length - 1].length - 3);
        }

        if(path[path.length - 1] === "main")
        {
            path.length -= 1;
        }

        final.push(...path);
    }

    return final.filter((value)=>value.length > 0).join(".");
}

function getPath(master, path)
{
    let current = master;

    for(let i = 0; i < path.length; i++)
    {
        let fragment = path[i];

        if(fragment === "") continue;

        if(current[fragment] === undefined)
        {
            return;
        }

        current = current[fragment];
    }

    return current;
}

function generatePath(master, path, container)
{
    let current = master;

    for(let i = 0; i < path.length - 1; i++)
    {
        let fragment = path[i];

        if(fragment === "") continue;

        if(current[fragment] === undefined)
        {
            let new_container = {};
            current[fragment] = new_container;
        }

        current = current[fragment];
    }

    current[path[path.length - 1]] = container;
}

export default Loader