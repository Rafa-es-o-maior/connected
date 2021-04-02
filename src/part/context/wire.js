import { Color } from "../../../../map/shared_system.js";

function setup(app)
{
    function mergeContext(ev)
    {
        let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

        if(app.world.loadedWorld.map.isValid(pos.x, pos.y))
        {
            let tile = app.world.loadedWorld.map.get(pos.x, pos.y);
            let layer = tile.layers[app.tools.layer.selected];
            let pointing_shared_system = layer.getSharedSystem();

            if(pointing_shared_system !== null)
            {
                ev.merge({
                    ["shared system"]:{
                        ["set color"]: function(){
                            
                            pointing_shared_system.color = Color.from(prompt("set color"));
                        }
                    }
                })
            }
        }
        else if(Math.random() * 10 < 1)
        {
            let f = function()
            {
                let ret = {};

                ret.a = f;
                ret.b = f;
                ret.c = f;

                return ret;
            }

            ev.merge({
                ["Welcome to the dark side"]: f
            })
        }
    }

    app.event.addEventListener("context", mergeContext);
}


export {setup};