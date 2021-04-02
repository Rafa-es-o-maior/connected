function setup(app, container)
{
    container.selected = 0;

    function layerSelector(callback)
    {
        let ret = {};

        let layer_count = app.world.loadedWorld.map.get(0, 0).layers.length;

        for(let idx = 0; idx < layer_count; idx++)
        {
            ret[("layer " + idx) + (container.selected === idx ? " (selected)": "")] = callback.bind(null, idx);
        }

        return ret;
    }

    container.layerSelector = layerSelector;

    function addLayer()
    {
        for(let y = 0; y < app.world.loadedWorld.map.height; y++)
        {
            for(let x = 0; x < app.world.loadedWorld.map.width; x++)
            {
                app.world.loadedWorld.map.get(x, y).createLayer();
            }
        }
    }

    function removeLayer(idx)
    {
        for(let y = 0; y < app.world.loadedWorld.map.height; y++)
        {
            for(let x = 0; x < app.world.loadedWorld.map.width; x++)
            {
                app.world.loadedWorld.map.get(x, y).layers.splice(idx, 1);
            }
        }

        if(app.world.loadedWorld.map.get(0, 0).layers.length <= container.selected)
        {
            container.selected--;
        }
    }

    app.context.mergeGlobalContext({
        layer: function()
        {
            let ret = layerSelector(function(idx){
                container.selected = idx;
            });


            ret["add layer"] = addLayer;
            if(app.world.loadedWorld.map.get(0, 0).layers.length > 1)
            {
                ret["remove layer"] = layerSelector(removeLayer);
            }
            return ret;
        }
    })

    app.keybinds.addCallback(["ArrowUp"], function()
    {
        let layer_count = app.world.loadedWorld.map.get(0, 0).layers.length;
        
        container.selected = Math.min(layer_count - 1, container.selected + 1);
        app.toast.addToast("layer selection++");
    });

    app.keybinds.addCallback(["ArrowDown"], function()
    {
        container.selected = Math.max(0, container.selected - 1);
        app.toast.addToast("layer selection--");
    });

    app.keybinds.addCallback(["+"], addLayer);
}

const requiring = ["world", "toast", "context", "keybinds"]

export { setup, requiring }