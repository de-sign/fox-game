// Import
import EventEmitter from 'eventemitter3';

import { TListeners, TData, TEmptyData, TFlag, TCallback } from '../Core/Type';


const rData = /data-/;

export class HTML extends EventEmitter {


    public static oBody: HTML = new HTML(document.body);


    public static get(sId: string): HTML | null {
        const hElement = document.getElementById(sId);
        return hElement ? new HTML(hElement) : null;
    }


    private _oListeners: TListeners = {};
    
    public hElement: HTMLElement;
    public oComputedStyle: CSSStyleDeclaration;


    constructor(hElement: HTMLElement) {
        super();
        this.hElement = hElement;
        this.oComputedStyle = window.getComputedStyle(hElement);
    }


    // Get HTML
        // ----- Parent
    public getClosest(sQuery: string): HTML | null {
        const hElement = this.hElement.closest(sQuery);
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getParent(): HTML | null {
        const hElement = this.hElement.parentElement;
        return hElement ? new HTML(hElement) : null;
    }

    public getPrevious(): HTML | null {
        const hElement = this.hElement.previousElementSibling;
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getClone(bDeep?: boolean): HTML {
        return new HTML( <HTMLElement>this.hElement.cloneNode(bDeep) );
    }

    public getNext(): HTML | null {
        const hElement = this.hElement.nextElementSibling;
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

        // ----- Child
    public getFirstChild(): HTML | null {
        const hElement = this.hElement.firstElementChild;
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getChild(nIndex: number = 0): HTML | null {
        const hElement = this.hElement.children.item(nIndex);
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getChildren(): HTML[] {
        const aHTML: HTML[] = [];
        [...this.hElement.children].forEach( hElement => {
            aHTML.push( new HTML(<HTMLElement>hElement) );
        } );
        return aHTML;
    }

    public getLastChild(): HTML | null {
        const hElement = this.hElement.lastElementChild;
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

        // ----- Deep Child
    public getClass(sClass: string, nIndex: number = 0): HTML | null {
        const hElement = this.hElement.getElementsByClassName(sClass).item(nIndex);
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getAllClass(sClass: string): HTML[] {
        const aHTML: HTML[] = [];
        [...this.hElement.getElementsByClassName(sClass)].forEach( hElement => {
            aHTML.push( new HTML(<HTMLElement>hElement) );
        } );
        return aHTML;
    }

    public getTag(sTagName: string, nIndex: number = 0): HTML | null {
        const hElement = this.hElement.getElementsByTagName(sTagName).item(nIndex);
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getAllTag(sTagName: string): HTML[] {
        const aHTML: HTML[] = [];
        [...this.hElement.getElementsByTagName(sTagName)].forEach( hElement => {
            aHTML.push( new HTML(<HTMLElement>hElement) );
        } );
        return aHTML;
    }

    public getCSS(sQuery: string): HTML | null {
        const hElement = this.hElement.querySelector(sQuery);
        return hElement ? new HTML(<HTMLElement>hElement) : null;
    }

    public getAllCSS(sQuery: string): HTML[] {
        const aHTML: HTML[] = [];
        [...this.hElement.querySelectorAll(sQuery)].forEach( hElement => {
            aHTML.push( new HTML(<HTMLElement>hElement) );
        } );
        return aHTML;
    }


    // Attribute
    public set oAttribute(oAttribute: TData) {
        this.hElement.getAttributeNames().forEach( sName => {
            if( !oAttribute[sName] ){
                this.hElement.removeAttribute(sName);
            }
        } );
        
        for( let sName in oAttribute){
            this.setAttribute(sName, oAttribute[sName]);
        }
    }

    public get oAttribute(): TData {
        const oAttribute: TData = {};

        this.hElement.getAttributeNames().forEach( sName => {
            oAttribute[sName] = <string>this.hElement.getAttribute(sName);
        } );
        
        return oAttribute;
    }


    public setAttribute(sAttribute: string, sValue: string): this {
        if( this.hElement.getAttribute(sAttribute) != sValue ){
            this.hElement.setAttribute(sAttribute, sValue);
        }
        return this;
    }

    public removeAttribute(sAttribute: string): this {
        if( this.hElement.hasAttribute(sAttribute) ){
            this.hElement.removeAttribute(sAttribute);
        }
        return this;
    }

    public setAttributes(oAttribute: TEmptyData): this {
        for( let sName in oAttribute ){
            const sValue = oAttribute[sName];
            if( sValue == null ){
                this.removeAttribute(sName);
            } else {
                this.setAttribute(sName, sValue);
            }
        }
        return this;
    }

    public getAttribute(sAttribute: string): string | null {
        return this.hElement.getAttribute(sAttribute);
    }

    public hasAttribute(sAttribute: string): boolean {
        return this.hElement.hasAttribute(sAttribute);
    }


    // Data
    public set oData(oData: TData) {
        this.hElement.getAttributeNames().forEach( sName => {
            if( sName.match(rData) && !oData[ sName.replace(rData, '') ]){
                this.hElement.removeAttribute(sName);
            }
        } );
        
        for( let sName in oData){
            this.setData(sName, oData[sName]);
        }
    }

    public get oData(): TData {
        const oDatas: TData = {};

        this.hElement.getAttributeNames().forEach( sName => {
            if( sName.match(rData) ){
                oDatas[ sName.replace(rData, '') ] = <string>this.hElement.getAttribute(sName);
            }
        } );
        
        return oDatas;
    }


    public setData(sName: string, sValue: string): this {
        return this.setAttribute(`data-${sName}`, sValue);
    }

    public removeData(sName: string): this {
        return this.removeAttribute(`data-${sName}`);
    }

    public setDatas(oData: TEmptyData) {
        for( let sName in oData ){
            const sValue = oData[sName];
            if( sValue == null ){
                this.removeData(sName);
            } else {
                this.setData(sName, sValue);
            }
        }
    }

    public getData(sName: string): string | null {
        return this.hElement.getAttribute(`data-${sName}`);
    }

    public getDataNames(): string[] {
        const aNames: string[] = [];

        this.hElement.getAttributeNames().forEach( sName => {
            if( sName.match(rData) ){
                aNames.push(sName.replace(rData, ''));
            }
        } );
        
        return aNames;
    }

    public hasData(sName: string): boolean {
        return this.hElement.hasAttribute(`data-${sName}`);
    }


    // Class
    set aClass(aClass: string[]) {
        if( aClass.length ){
            this.setAttribute('class', aClass.join(' '));
        } else {
            this.removeAttribute('class');
        }
    }

    get aClass(): string[] {
        const sClass = this.hElement.getAttribute('class');
        return sClass ? sClass.split(' ') : [];
    }


    set sClass(sClass: string) {
        if( sClass ){
            this.setAttribute('class', sClass);
        } else {
            this.removeAttribute('class');
        }
    }

    get sClass(): string | null {
        return this.hElement.getAttribute('class');
    }


    public addClass(...aClasses: string[]): this {
        this.hElement.classList.add(...aClasses);
        return this;
    }

    public removeClass(...aClasses: string[]): this {
        this.hElement.classList.remove(...aClasses);
        return this;
    }

    public clearClass(): this {
        this.removeAttribute('class');
        return this;
    }

    public toggleClass(sClass: string, bForce?: boolean): boolean {
        return this.hElement.classList.toggle(sClass, bForce);
    }

    public setClass( oClass: TFlag ): this {
        const oClassList = this.hElement.classList;
        for( let sClass in oClass ){
            const bHas = oClassList.contains(sClass);
            if( oClass[sClass] && !bHas ){
                oClassList.add(sClass);
            } else if( !oClass[sClass] && bHas ){
                oClassList.remove(sClass);
            }
        }
        return this;
    }

    public hasClass(sClass: string): boolean {
        return this.hElement.classList.contains(sClass);
    }


    // Style
    public set sStyle(sStyle: string | null) {
        if( sStyle == null ){
            this.removeAttribute('style');
        } else {
            this.setAttribute('style', sStyle);
        }
    }

    public get sStyle(): string | null {
        return this.hElement.getAttribute('style');
    }


    public set oStyle( oStyle: TData ) {
        const oRawStyle = this.hElement.style;

        for( let nIndex = 0; nIndex < oRawStyle.length; nIndex++ ){
            const sName = oRawStyle.item(nIndex);
            if( !oStyle[sName] ){
                oRawStyle.removeProperty(sName);
            }
        }
        
        for( let sName in oStyle ){
            oRawStyle.setProperty(sName, oStyle[sName]);
        }
    }

    public get oStyle(): TEmptyData {
        const oStyle: TEmptyData = {},
            oRawStyle = this.hElement.style;

        for( let nIndex = 0; nIndex < oRawStyle.length; nIndex++ ){
            const sName = oRawStyle.item(nIndex);
            oStyle[sName] = oRawStyle.getPropertyValue(sName);
        }

        return oStyle;
    }


    public setStyle(sStyle: string, sValue: string, sPriority?: string): this {
        this.hElement.style.setProperty(sStyle, sValue, sPriority);
        return this;
    }

    public removeStyle(sStyle: string): this {
        this.hElement.style.setProperty(sStyle, null);
        return this;
    }

    public setStyles( oStyle: TEmptyData ): this {
        for( let sKey in oStyle ){
            if( oStyle[sKey] ){
                this.hElement.style.setProperty(sKey, oStyle[sKey]);
            } else {
                this.hElement.style.removeProperty(sKey);
            }
        }
        return this;
    }
    
    public getComputedStyle(sStyle: string): string | undefined {
        return this.oComputedStyle.getPropertyValue(sStyle);
    }
    
    public getStyle(sStyle: string): string {
        return this.hElement.style.getPropertyValue(sStyle);
    }

    public hasStyle(sStyle: string): boolean {
        return !!this.hElement.style.getPropertyValue(sStyle);
    }


    // Content
    public set sText(sText: string | null) {
        if( sText ){
            this.hElement.textContent = sText;
        } else {
            this.hElement.innerText = '';
        }
    }

    public get sText(): string | null {
        return this.hElement.textContent;
    }


    public set sHTML(sHTML: string | null) {
        if( sHTML ){
            this.hElement.innerHTML = sHTML;
        } else {
            this.hElement.innerText = '';
        }
    }

    public get sHTML(): string {
        return this.hElement.innerHTML;
    }
    

    public set bHidden(bHidden: boolean) {
        this.hElement.hidden = bHidden;
    }

    public get bHidden(): boolean {
        return this.hElement.hidden;
    }
    

    // DOM Manipulation
    private _manipulate(sFunction: keyof HTMLElement | keyof Element | keyof Node, ...aAdd: (HTML | HTMLElement | string)[]): this {
        if( this.hElement[sFunction] instanceof Function && aAdd.length ){
            const aContent: (HTMLElement | string)[] = [];
            aAdd.forEach( uContent => {
                if( uContent instanceof HTML ){
                    uContent = uContent.hElement;
                }
                aContent.push(uContent);
            } );
            
            (<Function>this.hElement[sFunction])(...aContent);
        }
        return this;
    }

        // ----- Parent
    public before(...aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('before', ...aAdd);
    }

    public replacePrevious(aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getPrevious();
            if( hTarget ){
                hTarget._manipulate('replaceWith', ...aAdd);
            }
        }
        return this;
    }

    public removePrevious(): this {
        const hElement = this.hElement.previousElementSibling;
        if( hElement ){
            this.hElement.remove();
        }
        return this;
    }


    public replace(aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('replaceWith', ...aAdd);
    }

    public remove(): this {
        this.hElement.remove();
        return this;
    }


    public after(aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('after', ...aAdd);
    }

    public replaceNext(aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getNext();
            if( hTarget ){
                hTarget._manipulate('replaceWith', ...aAdd);
            }
        }
        return this;
    }

    public removeNext(): this {
        const hElement = this.hElement.nextElementSibling;
        if( hElement ){
            this.hElement.remove();
        }
        return this;
    }

        // ----- Child
    public prepend(aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('prepend', ...aAdd);
    }

    public replaceFirstChild(...aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getFirstChild();
            if( hTarget ){
                hTarget._manipulate('replaceWith', ...aAdd);
            }
        }
        return this;
    }

    public removeFirstChild(): this {
        const hElement = this.hElement.firstElementChild;
        if( hElement ){
            hElement.remove();
        }
        return this;
    }


    public insert(nIndex: number, ...aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getChild(nIndex);
            if( hTarget ){
                hTarget._manipulate('before', ...aAdd);
            }
        }
        return this;
    }

    public replaceChild(nIndex: number, ...aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getChild(nIndex);
            if( hTarget ){
                hTarget._manipulate('replaceWith', ...aAdd);
            }
        }
        return this;
    }

    public replaceChildren(aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('replaceChildren', ...aAdd);
    }

    public removeChild(nIndex: number): this {
        const hElement = this.hElement.children.item(nIndex);
        if( hElement ){
            hElement.remove();
        }
        return this;
    }

    public removeChildren(): this {
        this.hElement.innerText = '';
        return this;
    }


    public append(aAdd: (HTML | HTMLElement | string)[]): this {
        return this._manipulate('append', ...aAdd);
    }

    public duplicate(bDeep?: boolean): this {
        return this._manipulate('append', <HTMLElement>this.hElement.cloneNode(bDeep));
    }

    public replaceLastChild(...aAdd: (HTML | HTMLElement | string)[]): this {
        if( aAdd.length ){
            const hTarget = this.getFirstChild();
            if( hTarget ){
                hTarget._manipulate('replaceWith', ...aAdd);
            }
        }
        return this;
    }

    public removeLastChild(): this {
        const hElement = this.hElement.lastElementChild;
        if( hElement ){
            hElement.remove();
        }
        return this;
    }

    // Listener
    public onEvent(sType: keyof HTMLElementEventMap, fCallback: TCallback, bCapture?: boolean): this {
        const sName = this._modifyListener(true, sType, bCapture);
        return this.on(sName, fCallback);
    }

    public onceEvent(sType: keyof HTMLElementEventMap, fCallback: TCallback, bCapture?: boolean): this {
        const sName = this._modifyListener(true, sType, bCapture);
        return this.once(sName, fCallback);
    }

    public offEvent(sType: keyof HTMLElementEventMap, fCallback: TCallback, bCapture?: boolean): this {
        const sName = this._modifyListener(true, sType, bCapture);
        return this.off(sName, fCallback);
    }

    public offAllEvent(): this {
        this.removeAllListeners();
        for( let sName in this._oListeners ){
            const [ sType, sCapture ] = sName.split('_'),
                bCapture = sCapture == 'capture';

            this.hElement.removeEventListener(sType, <any>this._oListeners[sName], bCapture);
        }
        this._oListeners = {};
        return this;
    }


    private _modifyListener(bAdd: boolean, sType: keyof HTMLElementEventMap, bCapture: boolean | undefined, bOnce: boolean = false): string {
        const sSuffixe = bCapture ? 'capture' : 'bubble',
            sName = `${sType}_${sSuffixe}`;
        
        if( bAdd && !this.listenerCount(sName) ){
            this._oListeners[sName] = () => {
                this.emit(sName);
                if( bOnce ){
                    this._modifyListener(false, sType, bCapture);
                }
            };
            this.hElement.addEventListener(sType, <any>this._oListeners[sName], bCapture);
        }
        else if( !bAdd && this.listenerCount(sName) == 1 ){
            this.hElement.removeEventListener(sType, <any>this._oListeners[sName], bCapture);
            delete this._oListeners[sName];
        }

        return sName;
    }
}