function setup(app, container)
{
    let registry = [];

    function setToolComponent(klass)
    {
        app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, new klass(app.world.loadedWorld)))
    }

    container.registerComponent = function(name, klass)
    {
        registry[name] = klass;

        app.context.mergeGlobalContext({
            components: {
                [klass.name || name]: setToolComponent.bind(null, klass)
            }
        })
    }

    container.getComponentByRegistryName = function(name)
    {
        return registry[name];
    }

    container.renderComponentAt = function(component, x, y)
    {
        let screen = app.world.math.positionToScreen(x, y);
        app.ctx.fillStyle = "#00ff0044";
        let rotatedSize = component.rotatedSize;
        app.ctx.fillRect(screen.x + 5, screen.y + 5, rotatedSize.x * app.tilesize - 10, rotatedSize.y * app.tilesize - 10);
        
        for(let interactor of Object.values(component.interactors))
        {
            // avoid using the component position

            let pos = interactor.rotatedPosition;
            pos.x += x;
            pos.y += y;

            let centre;

            if(app.world.loadedWorld.map.isValid(pos.x, pos.y))
            {
                let tile = app.world.loadedWorld.map.get(pos.x, pos.y);
                centre = (interactor.layer_idx + 1) / (tile.layers.length + 1);
            }
            else
            {
                centre = 0.5;
            }

            app.ctx.fillStyle = interactor.constructor.color;
            let interactor_screen = app.world.math.positionToScreen(pos.x + centre, pos.y + centre);
            app.ctx.fillRect(interactor_screen.x - 10, interactor_screen.y - 10, 20, 20);
        }
    }

    function mergeContext(ev)
    {
        let components = app.world.loadedWorld.components;

        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        let intersectedComponents = [];

        for(let component of components)
        {
            let rotatedSize = component.rotatedSize;
            if(component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
                component.y <= pos.y && component.y + rotatedSize.y > pos.y)
            {
                intersectedComponents.push(component);
            }
        }

        if(intersectedComponents.length === 0) return;

        let single = intersectedComponents.length === 1;

        let root = {};

        let merger = {};

        for(let i = 0; i < intersectedComponents.length; i++)
        {
            let component = intersectedComponents[i];

            let bucket;
            if(single)
            {
                bucket = merger;
            }
            else
            {
                let id = 0;
                while(merger[component.constructor.name + id] !== undefined)
                {
                    console.log(component.constructor.name + id);
                    id += 1;
                }

                bucket = {};
                merger[component.constructor.name + id] = bucket;
            }

            bucket["rotate clockwise"] = function()
            {
                component.rotation += Math.PI / 2;
            }

            bucket["rotate anticlockwise"] = function()
            {
                component.rotation -= Math.PI / 2;
            }

            bucket["set position"] = function() {
                app.world.loadedWorld.components.delete(component);
                app.tools.setPlacementTool(new app.component.tool.ComponentTool(app, component))
            }

            bucket["delete"] = function() {
                app.world.loadedWorld.components.delete(component);
            }

            for(let interactor of Object.values(component.interactors))
            {
                let interactor_pos = interactor.absolutePosition;

                if(interactor_pos.x == pos.x && interactor_pos.y == pos.y)
                {
                    root["interactor"] = {
                        ["set layer"]: app.tools.layer.layerSelector(function(idx)
                        {
                            interactor.layer_idx = idx;
                        })
                    };
                    break;
                }
            }
        }

        root.component = merger;

        ev.merge(root);
    }

    app.event.addEventListener("context", mergeContext);
}

const requiring = ["context", "tools"]

export {setup, requiring};