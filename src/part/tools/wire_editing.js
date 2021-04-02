function setup(app, container)
{
    let selection = null;

    function pushSelection()
    {
        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        if(app.world.loadedWorld.map.isValid(pos.x, pos.y))
        {
            if(selection.length === 0)
            {
                selection.push(pos);
            }
            else
            {

                let last = selection[selection.length - 1];
                
                let current = {x: last.x, y: last.y};

                while(current.x != pos.x || current.y != pos.y)
                {
                    let targeted_axis;

                    targeted_axis = Math.abs(current.x - pos.x) > Math.abs(current.y - pos.y)? "x" : "y";

                    current[targeted_axis] += current[targeted_axis] > pos[targeted_axis]? -1 : 1;

                    if(selection.length > 1)
                    {
                        let go_back = selection[selection.length - 2];
    
                        if(go_back.x === current.x && go_back.y === current.y)
                        {
                            selection.length -= 1; // delete last; go back on selection
                            continue;
                        }
                    }

                    selection.push({x: current.x, y: current.y});
                }
            }
        }
    }

    function wireTool(func, name)
    {
        return {
            begin()
            {
                selection = [];
                pushSelection();
            },
    
            move(ev)
            {
                pushSelection();
            },
    
            finish()
            {
                func(selection);
                selection = null;
            },

            cancel()
            {
                selection = null;
            },
    
            draw()
            {
                if(selection !== null)
                {
                    app.ctx.fillStyle = "#00000044";
                    for(let i = 0; i < selection.length; i++)
                    {
                        let selected = selection[i];
    
                        let r = [app.pan.x + selected.x * app.tilesize, app.pan.y + selected.y * app.tilesize, app.tilesize, app.tilesize];
                        app.ctx.fillRect(...r);
                    }
                }
            },

            name
        }
    }
    
    container.wirer = wireTool(function(selection)
    {
        app.world.loadedWorld.map.buildWiring(selection, app.tools.layer.selected);
    }, "wirer")

    container.eraser = wireTool(function(selection)
    {
        app.world.loadedWorld.map.eraseWiring(selection, app.tools.layer.selected);
    }, "eraser")

    app.tools.addToolToPool(container.wirer)
    app.tools.addToolToPool(container.eraser)

    app.tools.setTool(container.wirer, true)
    app.tools.setTool(container.eraser, false);
}

export {setup};