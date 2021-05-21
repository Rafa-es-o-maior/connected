import Tile from "./tile.js";
import { Side } from "./tilelayer.js";
import SharedSystem from "./shared_system.js";

class World
{
    #running

    constructor(width=10, height=10)
    {
        this.map = new WorldMap(this, width, height);
        this.components = new Set();
        this.#running = false;
    }

    get running()
    {
        return this.#running;
    }

    prepareRun()
    {
        this.queuedSystems = new Set();
        this.queuedComponents = new Set();

        this.map.prepareRun();

        for(let component of this.components)
        {
            component.prepareRun();
            this.queuedComponents.add(component);
        }

        this.#running = true;
    }

    stop()
    {
        this.#running = false;
    }

    tick()
    {
        this.#tickComponents();
        this.#tickSystems();
    }

    #tickComponents()
    {
        for(let component of this.queuedComponents){
            this.queuedComponents.delete(component);
            component.builder.evaluate(component);
        }
    }

    #tickSystems(){
        for(let system of this.queuedSystems)
        {
            if(system.state !== system.oldstate)
            {
                for(let listener of system.listeners)
                {
                    listener.owner.invalidate();
                }

                system.oldstate = system.state;
            }
        }

        this.queuedSystems.clear()
    }
}

class Map
{
    constructor(width, height, item_filler)
    {
        this.buildMap(width, height, item_filler);
    }

    buildMap(width, height, item_filler)
    {
        item_filler = item_filler === undefined?(x, y) => {return {x:x, y: y, neighbours: {}}}:item_filler;

        this.width = width;
        this.height = height;
        this._arr = new Array(width * height);

        for(let i = 0; i < this._arr.length; i++)
        {
            let pos = this._positionFromArray(i);
            this._arr[i] = item_filler(pos.x, pos.y);
        }

        for(let i = 0; i < this._arr.length; i++)
        {
            let pos = this._positionFromArray(i);
            let obj = this._arr[i];

            for(let side = 1; side <= 8; side <<= 1)
            {
                let relative = Side.toPosition(side);

                let absolute = {x: pos.x + relative.x, y: pos.y + relative.y};

                if(this.isValid(absolute.x, absolute.y))
                {
                    obj.neighbours[side] = this.get(absolute.x, absolute.y);
                }
            }
        }
    }

    _positionFromArray(pos)
    {
        return {x: pos % this.width, y: Math.floor(pos / this.width)};
    }

    _positionInArray(x, y)
    {
        return x + (y * this.width);
    }

    get(x, y)
    {
        return this._arr[this._positionInArray(x, y)];
    }

    set(x, y, obj)
    {
        this._arr[this._positionInArray(x, y)] = obj;
    }

    isValid(x, y)
    {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
}

class WorldMap extends Map
{
    #systems

    constructor(world, width, height)
    {
        super(width, height);
        this.world = world;
        this.#systems = new Set();
    }

    buildMap(width, height)
    {
        super.buildMap(width, height, (x, y)=>new Tile(this.world, x, y));
    }

    buildWiring(path, idx)
    {
        if(path.length < 1) return;

        if(path.length === 1)
        {
            let layer = this.get(path[0].x, path[0].y).layers[idx];

            if(layer.getSharedSystem() !== null) return;
        }

        let found_containing_system = [];

        for(let i = 0; i < path.length - 1; i++)
        {
            let tile = this.get(path[i].x, path[i].y);
            let other_tile = this.get(path[i + 1].x, path[i + 1].y);

            let layer = tile.layers[idx];
            let other_layer = other_tile.layers[idx];

            if(i === 0 && layer.getSharedSystem() !== null)
            {
                found_containing_system.push(layer);
            }

            if(other_layer.getSharedSystem() !== null)
            {
                found_containing_system.push(other_layer);
            }

            let relativeX = layer.x - other_layer.x;
            let relativeY = layer.y - other_layer.y;
    
            let side = Side.toSide(relativeX, relativeY);
    
            layer.setConnected(Side.opposite(side), true);
            other_layer.setConnected(side, true);
        }

        if(found_containing_system.length === 0)
        {
            // wire built does not collide against other wires

            let new_system = new SharedSystem(this.world);
            console.log("created system");

            this.#systems.add(new_system);

            let layer = this.get(path[0].x, path[0].y).layers[idx];

            layer.setSharedSystem(new_system);
            layer.spread();
        }
        else
        {
            let to_spread = found_containing_system[0];
            let to_check = [];

            for(let i = 1; i < found_containing_system.length; i++)
            {
                let layer = this.get(found_containing_system[i].x, found_containing_system[i].y).layers[idx];

                to_check.push(layer.getSharedSystem());
            }

            let layer = this.get(to_spread.x, to_spread.y).layers[idx];
            layer.spread();

            this.#checkSystems(...to_check);
        }
    }

    eraseWiring(path, idx)
    {
        if(path.length < 1) return;

        let to_update = [];
        let to_check = [];

        for(let i = 0; i < path.length; i++)
        {
            let tile = this.get(path[i].x, path[i].y);
            let layer = tile.layers[idx];

            let system = layer.getSharedSystem();
            
            if(system !== null)
            {
                for(let side = 1; side <= 8; side <<= 1)
                {
                    if(layer.isConnected(side))
                    {
                        let other_layer = tile.neighbours[side].layers[idx];

                        layer.setConnected(side, false);
                        other_layer.setConnected(Side.opposite(side), false);
                        
                        to_update.push(other_layer);
                    }
                }

                layer.clearSharedSystem(); // we are sure by this time all connections have been removed, so clear the system
                this.#checkSystems(system);
            }
        }

        let created_systems = [];

        for(let i = 0; i < to_update.length - 1; i++) // last one probably has a correct system when we go there so skip it
        {
            let layer = to_update[i];

            // if it includes, then it means that an older assignment here lead to it flowing to this tile
            // that system is presumably already correct so skip it

            let old_system = layer.getSharedSystem();

            if(old_system !== null)
            {
                if(!created_systems.includes(old_system))
                {
                    let system = new SharedSystem(this.world);
                    console.log("created system");
                    system.color = old_system.color;
                    this.#systems.add(system);
                    created_systems.push(system);
                    layer.setSharedSystem(system);
                    layer.spread();

                    this.#checkSystems(old_system);
                }
            }
        }
    }

    #checkSystems(...systems)
    {
        for(let system of systems)
        {
            if(system.bound_layers.size === 0)
            {
                this.#systems.delete(system);
                console.log("erased system");
            }
        }
    }

    prepareRun()
    {
        for(let system of this.#systems)
        {
            system.prepareRun();
        }
    }
}

export {World, Map, WorldMap};