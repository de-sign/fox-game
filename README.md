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
        - super()
            # Inherit of EventEmitter3

        + new Ticker
            # See PIXI.Ticker for details

        + new Store
            - Store._recover()
                # Use LocalStorage API

        + new InputManager
            - super()
                # Inherit of EventEmitter3
            + new InputControllerSet
            ~ Engine.ENGINE_START - #021 [ONCE]
            ~ InputManager.INPUT_CONTROLLER_CREATE - #042
            ?{ IF $OPTIONS.bAutoCreateController
                ~ InputManager.INPUT_SOURCE_CREATE - #041
            ?}

        + new SceneManager
            - super()
                # Inherit of EventEmitter3
            ~ Engine.ENGINE_START - #022 [ONCE]

        ?{ SWITCH $OPTIONS.cOutputManager
            + new OutputPixiJS
                - super()
                    # Inherit of OutputManager
                    - super()
                        # Inherit of EventEmitter3
                    ~ Window.RESIZE - #051
                - OutputManager._setRenderer()
                    - PIXI.autoDetectRenderer()
                        # See PIXI.autoDetectRenderer for details
                    ~ Engine.ENGINE_START - #023 [ONCE]
        ?}

        ~ SceneManager.SCENE_INITIALIZE - #034
        ~ SceneManager.SCENE_DESTROY - #035
            
        - Ticker.add()
            # See PIXI.Ticker for details
            - Engine._update()
            - Engine._render()


### 02 - Start of Engine
Retrace la pile d'execution lors du lancement du moteur de jeu.

    - Engine.start()
        - Ticker.start()
            # See PIXI.Ticker for details

        * Engine.ENGINE_START
            ~{ #021 [ONCE] - new InputManager 
                ?{ IF $OPTIONS.bKeyboard
                    - InputManager._createKeyboard()
                        # Use Keybaord API
                        - InputManager._getSource()
                            # See part 04 - Creation of Input Source
                        ~ Window.KEYUP / Window.KEYDOWN - #052
                ?}
                ?{ IF $OPTIONS.bGamepad
                    - InputManager._createGamepad()
                        # Use Gamepad API
                        - InputManager._getSource()
                            # See part 04 - Creation of Input Source
                ?}
            ~}
            ~{ #022 [ONCE] - new SceneManager
                ?{ IF $OPTIONS.cStartingScene
                    - SceneManager.changeScene()
                        ~ Engine.ENGINE_UPDATE - #031 [ONCE]
                ?}
            ~}
            ~{ #023 [ONCE] - OutputManager._setRenderer() 
                - OutputManager.resize()
                    - OutputPixiJS._resizeView()
                    - OutputPixiJS._scaleScene()
                    * OutputManager.OUTPUT_RESIZE
                        ~{ #033 - new CameraPixiJS 
                            - CameraPixiJS._centerInView()
                                * CameraPixiJS.CAMERA_RESIZE
                        ~}
            ~}


### 03 - Life of Engine
Retrace la pile d'execution à chaque frame du moteur de jeu.

    - Engine._update()
        * Engine.ENGINE_UPDATE
            ~{ #031 [ONCE] - SceneManager.changeScene() 
                - SceneManager._unsetScene()
                    - ScenePixiJS.destroy()
                        - CameraPixiJS.unlinkTo()
                        - CameraPixiJS.destroy()
                    * SceneManager.SCENE_DESTROY
                        ~{ #035 - new Engine 
                            - OutputManager.unlinkToScene()
                        ~}
                - SceneManager._setScene()
                    ?{ SWITCH $NEWSCENE
                        + new ScenePixiJS
                            - super()
                                # Inherit of Scene
                                - super()
                                    # Inherit of EventEmitter3
                            + new CameraPixiJS
                                - super()
                                    # Inherit of EventEmitter3
                                - CameraPixiJS._centerInView()
                                    * CameraPixiJS.CAMERA_RESIZE
                                ~ OutputManager.OUTPUT_RESIZE - #033
                    ?}
                    - Scene.initialize()
                        # Surchaged by DEVELOPPER
                        - CameraPixiJS.linkTo()
                    * SceneManager.SCENE_INITIALIZE
                        ~{ #034 - new Engine 
                            - OutputManager.linktToScene()
                        ~}
                * SceneManager.SCENE_CHANGE
            ~}

        - InputManager.update()
            ?{ IF $OPTIONS.bGamepad
                - InputManager._createGamepad()
                    # Use Gamepad API
                    - InputManager._getSource()
                        # See part 04 - Creation of Input Source
            ?}
            ?{ SWITCH InputSource
                - KeyboardSource.update()
                    - InputSource._setButtonValue()
                    ?{ IF "Keyboard API not SUPPORTED"
                        - KeyboardSource._setButtonName()
                    ?}
                    ?{ IF "one button updated"
                        $bSourceUpdate = true
                    ?}
                - GamepadSource.update()
                    ?{ IF "gamepad reconnected"
                        * InputManager.INPUT_SOURCE_RECONNECT
                    ?}
                    ?{ IF "gamepad disconected"
                        * InputManager.INPUT_SOURCE_DISCONNECT
                    ?}
                    - InputSource._setButtonValue()
                    ?{ IF "gamepad reconnected, disconected or one button updated"
                        $bSourceUpdate = true
                    ?}
            ?}
            ?{ IF $bSourceUpdate
                * InputSource.INPUT_SOURCE_UPDATE
                    ~{ #036 - new InputController
                        - InputController._updateButtons()
                            - InputController._setButtonOfSource()
                                - InputSource.getButton()
                                    ?{ IF "unknow button"
                                        - InputSource._getButtonsName()
                                    ?}
                                - InputController.getButton()
                        ?{ IF "one button updated"
                            * InputController.INPUT_CONTROLLER_UPDATE
                                ~{ #037 - InputControllerSet.add() 
                                    # Update InputControllerSet internal properties
                                ~}
                            * InputManager.INPUT_CONTROLLER_UPDATE
                        ?}
                    ~}
                * InputManager.INPUT_SOURCE_UPDATE
            ?}
            * InputManager.INPUT_UPDATE

        - SceneManager.update()
            ?{ IF "current scene"
                - ScenePixiJS.update()
                    # Surchaged by DEVELOPPER
            ?}
            * SceneManager.SCENE_UPDATE

        * Engine.ENGINE_POST_UPDATE
<br/>

    - Engine._render()
        * Engine.ENGINE_RENDER
            ~{ #032 [ONCE] - OutputManager.resize() 
                - OutputPixiJS._resizeView()
                - OutputPixiJS._scaleScene()
                * OutputManager.OUTPUT_RESIZE
                    ~{ #033 - new CameraPixiJS 
                        - CameraPixiJS._centerInView()
                            * CameraPixiJS.CAMERA_RESIZE
                    ~}
            ~}

        - TWEEN.update()

        - SceneManager.render()
            ?{ IF "current scene"
                - ScenePixiJS.render()
                    # Surchaged by DEVELOPPER
                    - CameraPixiJS.update()
                        - CameraPixiJS._restrictPosition()
                            - CameraPixiJS.getSceneBounds()
                        ?{ IF "camera updated"
                            * CameraPixiJS.CAMERA_UPDATE
                        ?}
            ?}
            * SceneManager.SCENE_RENDER

        - OutputPixiJS.render()
            - PIXI.render()
            - super()
                # Inherit of OutputManager
                * OutputManager.OUTPUT_RENDER

        * Engine.ENGINE_POST_RENDER


### 04 - Creation of Input Source
Retrace la pile d'execution à la création d'une source d'entrée.

    - InputManager._getSource()
        # Call at Engine.start() or InputManager.update()
        ?{ IF "unknow source"
            + new GamepadSource / KeyboardSource
                - super()
                    # Inherit of InputSource
                    - super()
                        # Inherit of EventEmitter3
                - InputSource._createButtonsName()
            * InputManager.INPUT_SOURCE_CREATE
                ~{ #041 - new InputManager 
                    - InputManager.createController()
                        + new InputController
                            - super()
                                # Inherit of EventEmitter3
                            - InputController._restore()
                            ~ InputSource.INPUT_SOURCE_UPDATE - #036
                        * InputManager.INPUT_CONTROLLER_CREATE
                            ~{ #042 - new InputManager 
                                - InputControllerSet.add()
                                    ~ InputController.INPUT_CONTROLLER_UPDATE #37
                            ~}
                ~}
        ?}


### 05 - Window Event
Retrace la pile d'execution aux déclenchement de divers evenements WINDOW.

    - Window.RESIZE
        ~{ #051 - new OutputPixiJS
            ?{ IF $OPTIONS.nAspectType != $.OUTPUT_ASPECT_TYPE.INITIAL
                - OutputManager.resize()
                    ~ Engine.ENGINE_RENDER - #032 [ONCE]
            ?}
        ~}
<br/>

    - Window.KEYUP / KEYDOWN
        ~{ #052 - InputManager._createKeyboard()
            - KeyboardSource.addEvent()
        ~}


### 06 - Destroy of Engine
Retrace la pile d'execution à la destruction du moteur de jeu.

    - Engine.destroy()
        - Engine.removeAllListeners()
            # Inherit of EventEmitter3

        - Engine.removeAllWindowListeners()

        - Ticker.destroy()
            # See PIXI.Ticker for details

        - InputManager.destroy()
            - InputManager.removeAllListeners()
                # Inherit of EventEmitter3
            ?{ SWITCH InputSource
                - InputSource.destroy()
                    - InputSource.removeAllListeners()
                        # Inherit of EventEmitter3
            ?}
            - InputController.destroy()
                - InputController.removeAllListeners()
                    # Inherit of EventEmitter3

        - SceneManager.destroy()
            - InputSource.removeAllListeners()
                # Inherit of EventEmitter3
            - SceneManager._unsetScene()
                - Scene.destroy()
                    - CameraPixiJS.unlinkTo()
                    - CameraPixiJS.destroy()
                * SceneManager.SCENE_DESTROY
                    ~{ #035 - new Engine 
                        - OutputManager.unlinkToScene()
                    ~}

        - OutputPixiJS.destroy()
            - PIXI.IRenderer.destroy()
                # See PIXI.autoDetectRenderer for details
            - OutputManager.destroy()
                # Inherit of OutputManager
                - InputSource.removeAllListeners()
                    # Inherit of EventEmitter3