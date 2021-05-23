import { World } from "../../../../map/world.js";

function setup(app)
{
    app.context.mergeGlobalContext({
        world: {
            save: function()
            {
                let reduced = app.world.loadedWorld.serialize();
                let file_contents = btoa(JSON.stringify(reduced));
                download("file.cnq", file_contents);
            },

            load: function()
            {
                upload(function(content)
                {
                    let json = atob(content);
                    let obj = JSON.parse(json);
                    
                    app.event.fire("worldloading");

                    app.world.loadedWorld = World.unserialize(obj);
                })
            }
        }
    })
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';

    element.click();
}

function upload(callback)
{
    var input = document.createElement('input');
    input.type = 'file';
    
    input.onchange = e => {
       var file = e.target.files[0]; 
    
       var reader = new FileReader();
       reader.readAsText(file,'UTF-8');

       reader.onload = readerEvent => {
          var content = readerEvent.target.result;
          callback(content);
       }
    
    }
    
    input.click();
}

const requiring = ["context"]

export {setup, requiring};