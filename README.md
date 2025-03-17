# DCL NEAT Library

This folder contains all the necessary files to include the NEAT protocal into your deployed Decentraland scene.

## Installation

**Install the npm package**

Download and install the Decentraland Neat package by running the following command:

```bash
npm i dcl-neat
```

## Usage
Import the neat library into your code

```code
import {neat} from 'dcl-neat'
```

## Configuration

Anywhere inside your Decentraland scene, place the following code with parameters:

```code
import {neat} from 'dcl-neat'

neat.init(
    false,  //remove the standard triangle GLB
    false,  //admin mode; allow creator to view neat locally
    false,  //hide avatars when close proximity
    false,  //auto rotation
    2,      //click distance
    {position: new Vector3(8,1,8)}, //transform arguments
    'neat-id'   //optional token id specific to this neat location
    ) 
```

## Resources

Learn more about NEATS and access the creator portal at our [website](http://neatbadge.com/).

If you need any help, join [Last Slice's Discord](https://discord.gg/rzdwp72t4g), where you'll find a #neat support channel for bug requests and more on demand help, or email us at info@lastslice.org.