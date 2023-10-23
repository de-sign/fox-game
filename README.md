<div align="center">
    <a href="https://fox-website.netlify.app" target="_blank">
        <img style="background-color: #333; padding: 25px; border-radius: 5px;" height="144" width="144" src="https://fox-website.netlify.app/assets/favicons/android-chrome-144x144.png">
    </a>
</div>
<div align="center">
    <h1>
        FOX Game<br/>
        Simple low level Game Engine<br/>
        for develop your small game !
    </h1>
</div>
<br/>
<br/>

__FOX Game__ est un moteur de jeu bas niveau, simple d'utilisation vous permettant de créer des prototypes ou de très petits jeux rapidement.


## Engine LifeCycle
Retrace la pile d'execution des fonctions lors des différentes phases de vie du jeu.<br/>
__Attention !__ Pour simplifier la démarche, ceci correspond à un moteur de jeu tournant avec PixiJS. __Attention !__ 

Lexique :

    - : Call function
    + : Create instance
    ? : ?{ Conditional ?}
    $ : Given variables
    ~ : ~{ Listen event ~}
    * : Emit event
    # : #{ Commentary #}

### 01 - Creation of Engine
Retrace la pile d'execution lors de la création du moteur de jeu.

    + new Engine
        + new Ticker
            # See PIXI.Ticker for details

        + new Store
            - StoreM._recover()
                # Use LocalStorage API

        + new InputManager
            + new InputControllerSet
            ~{ Engine.ENGINE_START [ONCE]
                ?{ IF $OPTIONS.bKeyboard
                    - InputM._createKeyboard()
                        # Use Keybaord API
                        - InputM._getSource()
                            ?{ IF "unknow source"
                                + new KeyboardSource
                                    - super()
                                        # Inherit of InsputSource
                                    - KeyboardS._createButtonsName()
                                * InputM.INPUT_SOURCE_CREATE
                            ?}
                        ~{ Window.KEYUP && Window.KEYDOWN
                            - InputS.addEvent
                        ~}
                ?}
                ?{ IF $OPTIONS.bGamepad
                    - InputM._createGamepad()
                        # Use Gamepad API
                        - InputM._getSource()
                            ?{ IF "unknow source"
                                + new GamepadSource
                                    - super()
                                        # Inherit of InsputSource
                                    - GamepadS._createButtonsName()
                                * InputM.INPUT_SOURCE_CREATE
                            ?}
                ?}
            ~}
            ~{ InputM.INPUT_CONTROLLER_CREATE
                - InputCSet.add()
                    ~{ InputC.INPUT_CONTROLLER_UPDATE
                        # Update internal properties
                    ~}
            ~}
            ?{ IF $OPTIONS.bAutoCreateController
                ~{ InputM.INPUT_SOURCE_CREATE
                    - InputM.createController()
                        + new InputController
                            - InputC._restore()
                            ~{ InputS.INPUT_SOURCE_UPDATE
                                - InputC._updateButtons()
                                    - InputC._setButtonOfSource()
                                        - InputS.getButton()
                                            ?{ IF "unknow button"
                                                - InputS._getButtonsName()
                                            ?}
                                        - InputC.getButton()
                                ?{ IF "one button updated"
                                    * InputC.INPUT_CONTROLLER_UPDATE
                                    * InputM.INPUT_CONTROLLER_UPDATE
                                ?}
                            ~}
                        * InputM.INPUT_CONTROLLER_CREATE
                ~}
            ?}

        + new SceneManager
            ~{ Engine.ENGINE_START [ONCE]
                ?{ IF $OPTIONS.cStartingScene
                    - SceneM.changeScene()
                        ~{ Engine.ENGINE_UPDATE [ONCE]
                            - SceneM._unsetScene()
                                - Scene.destroy()
                                * SceneM.SCENE_DESTROY
                            - SceneM._setScene()
                                ?{ SWITCH $NEWSCENE
                                    + new ScenePixiJS
                                        - super()
                                            # Inherit of Scene
                                        + new CameraPixiJS
                                            - CameraPixiJS._centerInView()
                                                * CameraPixiJS.CAMERA_RESIZE
                                            ~{ OutputM.OUTPUT_RESIZE
                                                - CameraPixiJS._centerInView()
                                                    * CameraPixiJS.CAMERA_RESIZE
                                            ~}
                                ?}
                                - Scene.initialize()
                                    # Surchaged by DEVELOPPER
                                    - CameraPixiJS.linkTo()
                                * SceneM.SCENE_INITIALIZE
                            * SceneM.SCENE_CHANGE
                        ~}
                ?}
            ~}

        ?{ SWITCH $OPTIONS.cOutputManager
            + new OutputPixiJS
                - super()
                    # Inherit of OutputManager
                    ?{ IF $OPTIONS.nAspectType != $OUTPUT_ASPECT_TYPE.INITIAL
                        ~{ Window.RESIZE
                            - OutputM.resize()
                                ~{ Engine.ENGINE_RENDER [ONCE]
                                    - OutputPixiJS._resizeView()
                                    - OutputPixiJS._scaleScene()
                                    * OutputM.OUTPUT_RESIZE
                                ~}
                        ~}
                    ?}
                - OutputM._setRenderer()
                    - PIXI.autoDetectRenderer()
                    ~{ Engine.ENGINE_START [ONCE]
                        - OutputM.resize()
                            - OutputPixiJS._resizeView()
                            - OutputPixiJS._scaleScene()
                            * OutputM.OUTPUT_RESIZE
                    ~}
        ?}

        ~{ SceneM.SCENE_INITIALIZE
            - OutputM.linktToScene()
        ~}
        ~{ SceneM.SCENE_DESTROY
            - OutputM.unlinkToScene()
        ~}
            
        - Ticker.add()
            # See PIXI.Ticker for details
            - Engine._update()
            - Engine._render()

### 02 - Start of Engine
Retrace la pile d'execution lors du lancement du moteur de jeu.

    - Ticker.start()
        # See PIXI.Ticker for details
    * Engine.ENGINE_START
        # TODO Event Listener List

### 03 - Life of Engine
Retrace la pile d'execution à chaque frame du moteur de jeu.

    - Engine._update()
        * Engine.ENGINE_UPDATE
        - InputM.update()
            ?{ IF $OPTIONS.bGamepad
                - InputM._createGamepad()
                    # Use Gamepad API
                    - InputM._getSource()
                        ?{ IF "unknow source"
                            + new GamepadSource
                            * InputM.INPUT_SOURCE_CREATE
                        ?}
            ?}
            ?{ SWITCH InputSource
                - KeyboardS.update()
                    - InputS._setButtonValue()
                    - KeyboardS._setButtonName()
                        # Only if Keyboard API not SUPPORTED
                    ?{ IF "one button updated"
                        * InputS.INPUT_SOURCE_UPDATE
                    ?}
                - GamepadS.update()
                    ?{ IF "gamepad reconnected"
                        * InputM.INPUT_SOURCE_RECONNECT
                    ?}
                    ?{ IF "gamepad disconected"
                        * InputM.INPUT_SOURCE_DISCONNECT
                    ?}
                    - InputS._setButtonValue()
                    ?{ IF "gamepad reconnected, disconected or one button updated"
                        * InputM.INPUT_SOURCE_UPDATE
                    ?}
            ?}
            ?{ IF "source updated"
                * InputM.INPUT_SOURCE_UPDATE
            ?}
            * InputM.INPUT_UPDATE

        - SceneM.update()
            ?{ IF "current scene"
                - ScenePixiJS.update()
                    # Surchaged by DEVELOPPER
            ?}
            * SceneM.SCENE_UPDATE
        * Engine.ENGINE_POST_UPDATE

    - Engine._render()
        - SceneM.render()
            ?{ IF "current scene"
                - ScenePixiJS.render()
                    # Surchaged by DEVELOPPER
                    - CameraPixiJS.update();
            ?}
            * SceneM.SCENE_RENDER
        - OutputPixiJS.render()
            - PIXI.render()
            - super()
                # Inherit of OutputManager
                * OutputM.OUTPUT_RENDER


### 04 - Destroy of Engine


## Manager LifeCycle


### 11 - 