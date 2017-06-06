import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
    selector: 'modal-header',
    template: `<ng-content></ng-content>`
})
export class ModalHeader {

}

@Component({
    selector: 'modal-content',
    template: `<ng-content></ng-content>`
})
export class ModalContent {

}

@Component({
    selector: 'modal-footer',
    template: `<ng-content></ng-content>`
})
export class ModalFooter {

}

@Component({
    selector: 'ng-modal',
    template: `
<div class="modal" 
     tabindex="-1"
     role="dialog"
     #modalRoot
     (keydown.esc)="closeOnEscape ? close() : 0"
     [ngClass]="{ in: isOpened, fade: isOpened }"
     [ngStyle]="{ display: isOpened ? 'block' : 'none' }"
     (click)="closeOnOutsideClick ? close() : 0">
    <div [class]="'modal-dialog ' + modalClass" (click)="preventClosing($event)">
        <div class="modal-content" tabindex="0" *ngIf="isOpened">
            <div class="modal-header" *ngIf="showHeader">
                <button *ngIf="!hideCloseButton" type="button" class="close" data-dismiss="modal" [attr.aria-label]="cancelButtonLabel || 'Close'" (click)="close()"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" *ngIf="title">{{ title }}</h4>
                <ng-content select="modal-header"></ng-content>
            </div>
            <div class="modal-body" *ngIf="showBody">
                <ng-content select="modal-content"></ng-content>
            </div>
            <div class="modal-footer" *ngIf="showFooter">
                <ng-content select="modal-footer"></ng-content>
                <button *ngIf="cancelButtonLabel" type="button" class="btn btn-default" data-dismiss="modal" (click)="close()">{{ cancelButtonLabel }}</button>
                <button *ngIf="submitButtonLabel" type="button" class="btn btn-primary" (click)="onSubmit.emit(undefined)">{{ submitButtonLabel }}</button>
            </div>
        </div>
    </div>
</div>
`
})
export class Ng2Modal implements OnDestroy {

    // -------------------------------------------------------------------------
    // Inputs
    // -------------------------------------------------------------------------

    @Input()
    public modalClass: string;

    @Input()
    public closeOnEscape = true;

    @Input()
    public closeOnOutsideClick = true;

    @Input()
    public title: string;

    @Input()
    public hideCloseButton = false;

    @Input()
    public cancelButtonLabel: string;

    @Input()
    public submitButtonLabel: string;

    @Input()
    showHeader = true;

    @Input()
    showBody = true;

    @Input()
    showFooter = true;

    // -------------------------------------------------------------------------
    // Outputs
    // -------------------------------------------------------------------------

    @Output()
    public onOpen = new EventEmitter(false);

    @Output()
    public onClose = new EventEmitter(false);

    @Output()
    public onSubmit = new EventEmitter(false);

    // -------------------------------------------------------------------------
    // Public properties
    // -------------------------------------------------------------------------

    public isOpened = false;

    // -------------------------------------------------------------------------
    // Private properties
    // -------------------------------------------------------------------------

    @ViewChild('modalRoot')
    public modalRoot: ElementRef;

    private backdropElement: HTMLElement;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor() {
        this.createBackDrop();
    }

    // -------------------------------------------------------------------------
    // Lifecycle Methods
    // -------------------------------------------------------------------------

    ngOnDestroy() {
        document.body.className = document.body.className.replace(/modal-open\b/, '');
        if (this.backdropElement && this.backdropElement.parentNode === document.body) {
            document.body.removeChild(this.backdropElement);
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    open(...args: any[]) {
        if (this.isOpened) { return; }

        this.isOpened = true;
        document.body.appendChild(this.backdropElement);
        window.setTimeout(() => this.modalRoot.nativeElement.focus(), 0);
        document.body.className += ' modal-open';
        this.onOpen.emit(args);
    }

    close(...args: any[]) {
        if (!this.isOpened) { return; }

        this.isOpened = false;
        document.body.removeChild(this.backdropElement);
        document.body.className = document.body.className.replace(/modal-open\b/, '');
        this.onClose.emit(args);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    public preventClosing(event: MouseEvent) {
        event.stopPropagation();
    }

    private createBackDrop() {
        this.backdropElement = document.createElement('div');
        this.backdropElement.classList.add('modal-backdrop');
        this.backdropElement.classList.add('fade');
        this.backdropElement.classList.add('in');
    }

}