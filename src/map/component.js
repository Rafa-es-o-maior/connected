import { Color } from "./shared_system.js";

function rotate(x, y, originX, originY, rotation)
{
    let translatedX = x - originX;
    let translatedY = y - originY;

    let c = Math.cos(rotation)
    let s = Math.sin(rotation)

    let rotatedX = translatedX * c - translatedY * s
    let rotatedY = translatedX * s + translatedY * c

    return {x:rotatedX + originX, y: rotatedY + originY};
}

class Component
{
    constructor(world, x, y, layout)
    {
        this.layout = layout || this.getLayout();
        this.rotation = Rotation.NORMAL;

        this.world = world;
        this.x = x;
        this.y = y;

        this.#buildLayout();
    }

    #buildLayout()
    {
        this.width = this.layout.width;
        this.height = this.layout.height;

        this.interactors = {};

        for(let i = 0; i < this.layout.interactors.length; i++)
        {
            let component_declare = this.layout.interactors[i];
            this.interactors[component_declare.name] = this.#fromDeclaration(component_declare);
        }
    }

    #fromDeclaration(declared)
    {
        return new declared.interactor(this, declared.x, declared.y);
    }

    rebuildLayout()
    {
        this.width = this.layout.width;
        this.height = this.layout.height;

        let names = Object.keys(this.layout.interactors);

        for(let i = 0; i < this.layout.interactors.length; i++)
        {
            let component_declare = this.layout.interactors[i];
            if(this.interactors[component_declare.name] === undefined)
            {
                this.interactors[component_declare.name] = this.#fromDeclaration(component_declare);
            }
            else
            {
                let interactor = this.interactors[component_declare.name];
                interactor.relativeX = component_declare.x;
                interactor.relativeY = component_declare.y;
                names.splice(names.indexOf(component_declare.name), 1);
            }
        }

        for(let i = 0; i < names.length; i++)
        {
            this.layout.interactors[names[i]] = undefined;
        }
    }

    get rotatedSize()
    {
        let pos = rotate(this.width, this.height, 0, 0, this.rotation);

        return {x: Math.abs(Math.round(pos.x)), y: Math.abs(Math.round(pos.y))};
    }

    getLayout()
    {
        throw new Error("Not Implemented");
    }

    prepareRun()
    {
        for(let interactor of Object.values(this.interactors))
        {
            interactor.prepareRun();
        }
    }

    evaluate()
    {
        throw new Error("Not Implemented")
    }

    invalidate()
    {
        this.world.queuedComponents.add(this);
    }
}

class Layout
{
    constructor(width, height, interactors)
    {
        this.width = width;
        this.height = height;
        this.interactors = interactors;
    }
}

class Interactor
{
    static color = new Color(0, 0, 0);

    static positioned(name, x, y)
    {
        return {interactor: this, name, x, y};
    }

    constructor(owner, x, y)
    {
        // these coordinates are without rotation applied

        this.owner = owner;
        this.x = x;
        this.y = y;
        this.layer_idx = 0;

        this.system = null;
    }

    get absolutePosition()
    {
        let rotated = this.rotatedPosition;

        return {x: rotated.x + this.owner.x, y: rotated.y + this.owner.y};
    }

    get unflooredPosition()
    {
        let originX = (this.owner.width - 1) / 2;
        let originY = (this.owner.height - 1) / 2;

        return rotate(this.x, this.y, originX, originY, this.owner.rotation);
    }

    get rotatedPosition()
    {
        let pos = this.unflooredPosition;

        return {x: Math.floor(pos.x.toFixed(2)), y: Math.ceil(pos.y.toFixed(2))};
    }

    get world()
    {
        return this.owner.world;
    }

    prepareRun()
    {
        let pos = this.absolutePosition;
        let tile = this.world.map.get(pos.x, pos.y);
        let layer = tile.layers[this.layer_idx];
        this.system = layer.getSharedSystem();
    }
}

class Listener extends Interactor
{
    static color = new Color(255, 0, 0);

    prepareRun()
    {
        super.prepareRun();
        if(this.system !== null)
        {
            this.system.listeners.add(this);
        }
    }

    get state()
    {
        return this.system !== null && this.system.state;
    }
}

class Emitter extends Interactor
{
    static color = new Color(0, 0, 255);

    prepareRun()
    {
        super.prepareRun();
    }

    setState(newstate)
    {
        if(this.system !== null)
        {
            if(newstate)
            {
                this.system.activate(this);
            }
            else
            {
                this.system.deactivate(this);
            }
        }
    }
}

const Rotation = {
    NORMAL: 0,
    CLOCKWISE: Math.PI / 2,
    INVERTED: Math.PI,
    ANTICLOCKWISE: Math.PI * 1.5
}

export default Component;
export {Rotation, Interactor, Layout, Listener, Emitter};