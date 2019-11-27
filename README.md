# node-streamdeck-linux
Lightweight, configurable Elgato Streamdeck node client for linux / X11 systems

## Install
* pacman -S xdotool
* npm install

## Usage
* Modify config.txt
* node index.js

## config.txt examples
```
0 git folder autoback
^---- which key to target
  ^---- text displayed. Wrap in quotes if text contains spaces. autowraps.
      ^---- open a new streamdeck folder on click
             ^---- automatically go back up one folder level after an action inside this folder has been triggered
             
- 1 "close others" "xdk:Alt_L+w t o"
^---- indented, one folder below root
  ^---- which key to target
    ^---- display "close others" on button
                   ^---- send Alt_L+w t o keystrokes via xdotool on click

- 2 "redshft night" "exec:_redshift-night"
^---- indented, one folder below root
  ^---- which key to target
    ^---- button label
                    ^---- execute program "_redshift-night" on click
```
