function setup(app, container)
{
    container.addCallback = function(sequence, callback)
    {
        callbacks.push({sequence, callback});
    }

    let callbacks = [];
    let pressed_sequence = [];

    function keydown(ev)
    {
        if(!ev.repeat || pressed_sequence.length == 1)
        {
            if(!pressed_sequence.includes(ev.key))
            {
                pressed_sequence.push(ev.key);
            }
        
            for(let i = 0; i < callbacks.length; i++)
            {
                if(arrayEquals(callbacks[i].sequence, pressed_sequence))
                {
                    callbacks[i].callback();
                    break;
                }
            }
        }
    }

    function keyup(ev)
    {
        if(!ev.repeat && pressed_sequence.includes(ev.key))
        {
            pressed_sequence.splice(pressed_sequence.indexOf(ev.key), 1);
        }
    }

    app.event.addEventListener("keydown", keydown);
    app.event.addEventListener("keyup", keyup);
}


function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }


export {setup};