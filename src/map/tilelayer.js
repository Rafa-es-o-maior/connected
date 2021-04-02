class TileLayer
{
    #shared_system

    constructor(owner)
    {
        this.owner = owner;
        this.connections = 0b0000;
        this.#shared_system = null;
    }

    getSharedSystem()
    {
        return this.#shared_system;
    }

    clearSharedSystem()
    {
        if(this.#shared_system !== null)
        {
            this.#shared_system.bound_layers.delete(this);
            this.#shared_system = null;
        }
    }

    setSharedSystem(new_system)
    {
        this.clearSharedSystem();

        this.#shared_system = new_system;
        this.#shared_system.bound_layers.add(this);
    }

    get idx()
    {
        return this.owner.layers.indexOf(this);
    }

    get x()
    {
        return this.owner.x;
    }

    get y()
    {
        return this.owner.y;
    }

    get world()
    {
        return this.owner.world;
    }

    isConnected(side)
    {
        return (this.connections & side) > 0;
    }

    setConnected(side, value)
    {
        // with:
        // side = 0b0010
        // connections = 0b0100
        if(value)
        {
            this.connections |= side;
            // connections = 0b0110
        }
        else
        {
            // side becomes 0b1101
            this.connections &= ~side;
            // connections = 0b0100
        }
    }

    spread(pass)
    {
        pass = pass || new Set();

        for(let side = 1; side <= 8; side <<= 1)
        {
            this.spreadToSide(side, pass);
        }
    }

    spreadToSide(side, pass)
    {
        pass = pass || new Set();

        if(this.isConnected(side))
        {
            let this_system = this.getSharedSystem();
            let neighbour_tile = this.owner.neighbours[side];

            if(neighbour_tile !== undefined)
            {
                let neighbour = neighbour_tile.layers[this.idx];
                let other_system = neighbour.getSharedSystem();

                if(!pass.has(neighbour))
                {
                    if(other_system !== null)
                    {
                        this_system.color = this_system.color.blend(other_system.color, 1 / (this_system.bound_layers.size + 1));
                    }
                    neighbour.setSharedSystem(this.getSharedSystem());
                    pass.add(neighbour);
                    neighbour.spread(pass);
                }
            }
        }
    }
}

function mapper(map)
{
    return function(side)
    {
        return map[side];
    }
}

const Side = {
	UP: 0b0001,
	LEFT: 0b0010,
	DOWN: 0b0100,
	RIGHT: 0b1000,
}

Side.opposite = mapper({[Side.UP]: Side.DOWN, [Side.DOWN]: Side.UP, [Side.LEFT]: Side.RIGHT, [Side.RIGHT]: Side.LEFT});
Side.clockwise = mapper({[Side.UP]: Side.RIGHT, [Side.DOWN]: Side.LEFT, [Side.LEFT]: Side.UP, [Side.RIGHT]: Side.DOWN});
Side.counterclockwise = mapper({[Side.UP]: Side.LEFT, [Side.DOWN]: Side.RIGHT, [Side.LEFT]: Side.DOWN, [Side.RIGHT]: Side.UP});
Side.toPosition = mapper({[Side.UP]: {x: 0, y: -1}, [Side.DOWN]: {x: 0, y: 1}, [Side.LEFT]: {x: -1, y: 0}, [Side.RIGHT]: {x: 1, y: 0}});

Side.toSide = function(x, y)
{
    if(Math.abs(x) + Math.abs(y) !== 1) return; // allow only adjacent positions to 0, 0

    if(x === 0)
    {
        return y === -1? Side.UP : Side.DOWN
    }
    else
    {
        return x === -1? Side.LEFT : Side.RIGHT
    };

}

export default TileLayer;
export {Side};