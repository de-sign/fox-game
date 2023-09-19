import { Engine } from '../Engine/Engine';

/**
 * Store options supplied to constructor.
 */
export interface IStoreOptions {
    aStorableKeys?: Array<string>
}

/**
 * Store Manager class.
 * 
 * Use for store data that can be transmitted between scenes.
 * If Key is defined in aStorableKeys, the manager stores data on LocalStorage.
 * @class
 */
export class Store {

    /** Engine that created the manager. */
    public readonly oEngine: Engine;
    
    /** Data saved by the manager. **/
    private _oData: { [key: string]: any } = {};
    /** Key stored in LocalStorage when they are set. */
    private _oStorableKeys: { [key: string]: boolean } = {};
    
    constructor(oEngine: Engine, oStoreOptions?: IStoreOptions) {

        this.oEngine = oEngine;

        // Définie les cléfs à sauvegarder via les options
        oStoreOptions?.aStorableKeys?.forEach( sKey => {
            this._oStorableKeys[sKey] = true;
        } );

        // Récupère les datas sauvegardées
        this._recover();
    }

    /** Return value of Key stored in Data. */
    public get(sKey: string): any {
        return this._oData[sKey];
    }

    /**
     * Define value of Key in Data.
     * If Key is defined in aStorableKeys, the manager stores data on LocalStorage.
     */
    public set(sKey: string, uValue: any): Store {
        this._oData[sKey] = uValue;
        // Sauvegarde si défini via option
        if( this._oStorableKeys[sKey] ){
            localStorage.setItem( sKey, JSON.stringify(uValue) );
        }
        return this;
    }

    /**
     * Remove Key stored in Data and return his value.
     * If Key is defined in aStorableKeys, the manager remove data on LocalStorage.
     */
    public remove(sKey: string): any {
        const uValue = this._oData[sKey];
        delete this._oData[sKey];

        // Supprime si défini par options
        if( this._oStorableKeys[sKey] ){
            delete this._oStorableKeys[sKey];
            localStorage.removeItem(sKey);
        }
        
        return uValue;
    }

    private _recover(): void {
        for( let nIndex = 0; nIndex < localStorage.length; nIndex++ ){
            const sKey = localStorage.key(nIndex);
            if(sKey){
                const sData = localStorage.getItem(sKey);
                this._oData[sKey] = sData ? JSON.parse(sData) : null;
            }
        }
    }
}