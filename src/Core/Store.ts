// Imports
import { TObject, TFlag } from '../Core/Type';
import { Engine } from './';



/**
 * Store options supplied to constructor.
 */
export interface IStoreOptions {
    aStorableKeys?: string[]
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
    private _oData: TObject = {};
    /** Key stored in LocalStorage when they are set. */
    private _oStorableKeys: TFlag = {};
    
    
    /** Constructor */
    constructor(oEngine: Engine, oStoreOptions?: IStoreOptions) {

        this.oEngine = oEngine;

        // Définie les cléfs à sauvegarder via les options
        oStoreOptions?.aStorableKeys?.forEach( sKey => {
            this._oStorableKeys[sKey] = true;
        } );

        // Récupère les datas sauvegardées
        this._recover();
    }


    /**
     * Define value of Key in Data.
     * If Key is defined in aStorableKeys, the manager stores data on LocalStorage.
     */
    public set(sKey: string, uValue: any): Store {
        this._oData[sKey] = uValue;

        // Sauvegarde si défini via options
        if( this._oStorableKeys[sKey] ){
            localStorage.setItem( sKey, JSON.stringify(uValue) );
        }
        return this;
    }

    /** Return if Key has value stored in Data. */
    public has(sKey: string): any {
        return !!this._oData[sKey];
    }

    /** Return value of Key stored in Data. */
    public get(sKey: string): any {
        return this._oData[sKey];
    }

    /**
     * Remove Key stored in Data and return his value.
     * If Key is defined in aStorableKeys, the manager remove data on LocalStorage.
     */
    public remove(sKey: string): any {
        const uValue = this._oData[sKey];
        delete this._oData[sKey];

        // Supprime si défini via options
        if( this._oStorableKeys[sKey] ){
            delete this._oStorableKeys[sKey];
            localStorage.removeItem(sKey);
        }
        
        return uValue;
    }

    /** Define Key in aStorableKeys, set value if given. */
    public setStorableKey(sKey: string, uValue?: any): Store {
        this._oStorableKeys[sKey] = true;
        if( uValue ){
            this.set(sKey, uValue);
        }
        return this;
    }


    /** Recover data stores on LocalStorage. */
    private _recover(): void {
        for( let nIndex = 0; nIndex < localStorage.length; nIndex++ ){
            const sKey = localStorage.key(nIndex);
            if(sKey){
                const sData = localStorage.getItem(sKey);
                this._oData[sKey] = sData ? JSON.parse(sData) : null;
                this._oStorableKeys[sKey] = true;
            }
        }
    }
}