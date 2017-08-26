# Totem
Totem project for CommonsLab

Language : 
-	PHP 7
- HTML5 / JS / CSS3

Made with  :
- ThreeJS r87
- Code Igniter 3.1.5
- JQuery 3.2.1
- Featherlight 1.7.8
- OctoPrint0.14
	
	Made for Raspberry Pi 2 B, but will work on Windows with a few adjustement.

TODO :

GENERAL :
- Better CSS
- More user friendly language ( ex : change "phase" for "step" )
- Add info bubble
- Controle step movement ( if 1 not completed, do not go to third... )

SETTING :
- add setting menus somwhere
- select language ( french, english, greek, spanish, german ) 
- printer setting : Size ( Width, Height, Depth )
- Filament color
	
GCODE Loader :
- controls options for phase 3
- Animate options for phase 4
- Relative mod for Relative GCODE File

Phase 1 :
- Auto mount sdcard on /media/sdcar
- auto moutn usb drive on /media/usb
- OBJ file support
- LAN upload UI
- Animate rotation of models in preview
- Init file if comming back from other phase

Phase 2 :
- Fix and normalize center pivot for every model
- add Duplicates UI
- add next step button
- when going to phase 3, check for warning
- Fix & Show collision / out of printer warning
- .stl file exports for cura engine of phase 3
- Animate camera movement when selecting objects

Phase 3: 
- UI to select and overview quick print setting
- UI to select folder for custom profile ( check for error )
- Add advanced setting ( manual setting of temp, speed etc...)
- Generate GCODE 
- Overview GCODE + controles
- Check GCODE for error if comming from phase 1

Phase 4:
- OctoPrint interaction
- if not canceled, prevent go back to other phase
- printer controle ( position, pause, stop, cancel etc...à
- Monitoring ( live Gcode, temp, stat, etc... )
- Webcam view + LAN view
- End of task warning
- Error Warning
