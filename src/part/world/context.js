import { Color } from "../../../../map/shared_system.js";

function setup(app)
{
    app.context.mergeGlobalContext({
        world: {
            save: function()
            {

            },

            load: function()
            {
                
            }
        }
    })
}

const requiring = ["context"]

export {setup, requiring};