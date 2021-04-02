class SharedSystem
{
    #activeEmitters

    constructor(world)
    {
        this.world = world;
        this.bound_layers = new Set();
        this.color = new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    }

    prepareRun()
    {
        this.#activeEmitters = new Set();
        this.listeners = new Set();
        this.oldstate = false;
    }

    activate(emitter)
    {
        this.#activeEmitters.add(emitter);
        this.#checkState();
    }

    deactivate(emitter)
    {
        this.#activeEmitters.delete(emitter);
        this.#checkState();
    }

    #checkState()
    {
        // this is called from activate and deactivate functions
        // where #activeEmitters normally increase or decrease 1 in length
        // this means that if this condition is true
        // the set has gone from size 0 to size 1 or vice-versa
        // resulting in a change of state
        if(this.#activeEmitters.size < 2)
        {
            this.world.queuedSystems.add(this);
        }
    }

    get state()
    {
        return this.#activeEmitters.size > 0;
    }

    get displayColor()
    {
        if(this.world.running)
        {
            return this.state? new Color(0, 255, 0) : new Color(255, 0, 0);
        }
        else
        {
            return this.color;
        }
    }
}

function fromHex(red, green, blue)
{
    return new Color(parseInt(red, 16), parseInt(green, 16), parseInt(blue, 16))
}

function fromNumbers(red, green, blue)
{
    return new Color(parseInt(red), parseInt(green), parseInt(blue))
}

class Color
{
    static from(s)
    {
        let match = s.match(/^#(?<red>[0-9a-fA-F]{2})(?<green>[0-9a-fA-F]{2})(?<blue>[0-9a-fA-F]{2})$/);

        if(match !== null)
        {
            return fromHex(match.groups.red, match.groups.green, match.groups.blue);
        }

        match = s.match(/^rgb\(\s*?(?<red>[0-9]{1,3})\s*?,\s*?(?<green>[0-9]{1,3})\s*?,\s*?(?<blue>[0-9]{1,3})\s*?\)$/);

        if(match !== null)
        {
            return fromNumbers(match.groups.red, match.groups.green, match.groups.blue);
        }
    }

    constructor(R, G, B)
    {
        this.R = R;
        this.G = G;
        this.B = B;
    }

    blend(other, alpha)
    {
        let R = (this.R * (1 - alpha)) + other.R * alpha;
        let G = (this.G * (1 - alpha)) + other.G * alpha;
        let B = (this.B * (1 - alpha)) + other.B * alpha;

        return new Color(R, G, B)
    }

    toString()
    {
        return "rgb(" + this.R + ", " + this.G + ", " + this.B + ")"
    }
}

export default SharedSystem;
export {Color}