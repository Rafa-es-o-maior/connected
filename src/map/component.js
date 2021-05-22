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

class ComponentBuilder
{
    constructor(name)
    {
        this.name = name;
    }

    build(component)
    {

    }

    evaluate(component)
    {
        
    }

    create(world, x, y)
    {
        return Component.from_builder(world, x, y, this);
    }
}

class Component
{
    constructor(world, x, y)
    {
        this.rotation = Rotation.NORMAL;

        this.world = world;
        this.x = x;
        this.y = y;

        this.width = 0;
        this.height = 0;

        this.interactors = {};
        this.builder = null;
    }

    static from_builder(world, x, y, builder)
    {
        let component = new this(world, x, y);
        component.builder = builder;
        builder.build(component);
        return component;
    }

    addInteractor(klass, name, x, y)
    {
        this.interactors[name] = new klass(this, x, y);
    }

    get rotatedSize()
    {
        let pos = rotate(this.width, this.height, 0, 0, this.rotation);

        return {x: Math.abs(Math.round(pos.x)), y: Math.abs(Math.round(pos.y))};
    }

    prepareRun()
    {
        for(let interactor of Object.values(this.interactors))
        {
            interactor.prepareRun();
        }
    }

    invalidate()
    {
        this.world.queuedComponents.add(this);
    }

    clone()
    {
        let component = new Component(this.world, this.x, this.y);
        
        component.builder = this.builder;

        component.rotation = this.rotation;
        component.width = this.width;
        component.height = this.height;

        let entries = Object.entries(this.interactors);

        for(let i = 0; i < entries.length; i++)
        {
            let interactor = entries[i][1];
            let klass = interactor.constructor;
            let copy = new klass(component, interactor.x, interactor.y);
            copy.layer_idx = interactor.layer_idx;
            component.interactors[entries[i][0]] = copy;
        }

        return component;
    }
}

class Interactor
{
    static color = new Color(0, 0, 0);

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
    #internal;

    static color = new Color(0, 0, 255);

    prepareRun()
    {
        this.#internal = false;
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

        this.#internal = newstate;
    }

    get state()
    {
        return this.#internal;
    }
}

const Rotation = {
    NORMAL: 0,
    CLOCKWISE: Math.PI / 2,
    INVERTED: Math.PI,
    ANTICLOCKWISE: Math.PI * 1.5
}

export default ComponentBuilder;
export {Rotation, Interactor, Listener, Emitter};