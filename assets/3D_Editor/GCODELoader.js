
/**
 * @author Lincoln 
 *
 * Description: A THREE loader for GCODE file.
 * 
 * The loader returns an array of lines geometry.
 *
 *
 * Usage exemple:
 *  var loader = new THREE.GCODELoader();
 *  loader.load( path, function ( geometry ) {
 *    var mesh = new THREE.Mesh();
 *    $.each(geometry, function(index, layer){
 *           var geometry = layer;
 *           var material = new THREE.LineBasicMaterial( {color: 0x00ff00} );
 *           var layer_line = new THREE.Line( geometry, material );
 *           mesh.add( layer_line );
 *     });
 *
 *     scene.add( mesh );
 *  });
 *
 */


THREE.GCODELoader = function ( manager ) {
    
        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    
};
    
THREE.GCODELoader.prototype = {

    constructor: THREE.GCODELoader,

    load: function ( url, onLoad, onProgress, onError ) {

        var scope = this;

        var loader = new THREE.FileLoader( scope.manager );
        loader.load( url, function ( text ) {
            onLoad( scope.parse( text ) );
        }, onProgress, onError );

    },

    parse: function ( data ) {

        function GCodeParser(handlers) {
            this.handlers = handlers || {};
        }
        
        // parse gcode text file line
        GCodeParser.prototype.parseLine = function(text, info) {
            text = text.replace(/;.*$/, '').trim(); // Remove comments
            if (text) {
                var tokens = text.split(' ');
                if (tokens) {
                    var cmd = tokens[0];
                    var args = {
                        'cmd': cmd
                    };
                    tokens.splice(1).forEach(function(token) {
                        if(token[0]){
                            var key = token[0].toLowerCase();
                            var value = parseFloat(token.substring(1));
                            args[key] = value;
                        }
                    });
                    var handler = this.handlers[tokens[0]] || this.handlers['default'];
                    if (handler) {
                        return handler(args, info);
                    }
                }
            }
        };
        
        //parse gcode text file into lines
        GCodeParser.prototype.parse = function(gcode) {
            var lines = gcode.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (this.parseLine(lines[i], i) === false) {
                break;
                }
            }
        };

        // interprete lines and generate geometry
        function createObjectFromGCode(gcode) {
            var relative = false;
            var cmd_ar = { "ordered" : [], "cmd_counter" : {} };
           
            var layers =  [[]] ;
            var lastLine = {
                x: 0,
                y: 0,
                z: 0,
                e: 0,
                f: 0
            };

            var parser = new GCodeParser({
                
                G0: function(args, line) {       
                    processCmd(args, line);
                },
                
                
                G1: function(args, line) {
                    processCmd(args, line);
                },
          
                G90: function(args) {
                    // G90: Set to Absolute Positioning
                    // Example: G90
                    // All coordinates from now on are absolute relative to the
                    // origin of the machine. (This is the RepRap default.)
            
                    relative = false;
                },
          
                G91: function(args) {
                    // G91: Set to Relative Positioning
                    // Example: G91
                    // All coordinates from now on are relative to the last position.
            
                    // TODO!
                    relative = true;
                },
          
                'default': function(args, info) {
                    //console.log('Ignored command:', args.cmd, args, info);
                    set_cmd_ar(args, info);
                }
            });
            
            //put vector into respective layer
            function processCmd(args, line){
                if(args.z !== undefined && args.z != lastLine.z){
                    layers.push([]);
                }

                var newLine = {
                    x: args.x !== undefined ? args.x : lastLine.x,
                    y: args.y !== undefined ? args.y : lastLine.y,
                    z: args.z !== undefined ? args.z : lastLine.z,
                    e: args.e !== undefined ? args.e : lastLine.e,
                    f: args.f !== undefined ? args.f : lastLine.f,
                };
                lastLine = newLine;
                if(lastLine.e > 0 && lastLine.f > 0){
                    layers[layers.length-1].push(newLine);
                }

            }
            
            //for debug, get all read cmd.
            function set_cmd_ar(args, info){
                cmd_ar.ordered.push( ['Ignored command:', args.cmd, args, info ] );
                if( cmd_ar.cmd_counter.hasOwnProperty(args.cmd ) ){
                    cmd_ar.cmd_counter[args.cmd] += 1 ;
                }else{
                    cmd_ar.cmd_counter[args.cmd] = 1;
                }
            }
          
            parser.parse(gcode);

            console.log(cmd_ar);

            // turn layer vector coordinates into layer of geometry
            var geometry_layers = [];

            $.each(layers, function(index, layer){
                var geometry = new THREE.Geometry();
                $.each(layer, function(index_point, point){
                    if(layer.length > 1){
                        geometry.vertices.push(new THREE.Vector3(point.x, point.z, point.y));
                    }
                });
                geometry_layers.push(geometry);
            });

            return geometry_layers;
        }

        //return array of geometry leyer
        return createObjectFromGCode(data);
        
    }

};
    