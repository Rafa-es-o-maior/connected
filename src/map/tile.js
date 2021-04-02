import TileLayer from "./tilelayer.js";

class Tile
{
    constructor(world, x, y)
    {
        this.world = world;
        this.x = x;
        this.y = y;
        this.layers = [];
        this.neighbours = {}; // to be filled by the map
        this.createLayer();
    }

    createLayer()
    {
        this.layers.push(new TileLayer(this));
    }
}

export default Tile;