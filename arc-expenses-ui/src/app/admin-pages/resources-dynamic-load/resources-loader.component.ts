import { Component, ComponentFactoryResolver, Input, OnInit, ViewChild } from '@angular/core';
import { AnchorInterfaceComponent } from '../../shared/dynamic-loader-anchor-components/anchor-interface.component';
import { AnchorDirective } from '../../shared/dynamic-loader-anchor-components/anchor.directive';
import { AnchorItem } from '../../shared/dynamic-loader-anchor-components/anchor-item';


/* in order for the component to work correctly, the injected component should have an id and a data input,
 * as well as an exportFormValue() function [if the getComponentFormValue() function will be used] */

@Component({
    selector: 'app-resource-loader',
    template: `<ng-template anchor-host></ng-template>`
})
export class ResourcesLoaderComponent implements OnInit {
    @Input() id: string;
    @Input() resource: AnchorItem;
    componentInstance: any;

    @ViewChild(AnchorDirective) resourceHost: AnchorDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {
        this.loadComponent();
    }

    loadComponent() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.resource.component);
        const viewContainerRef = this.resourceHost.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(componentFactory);
        this.componentInstance = componentRef.instance;

        if (this.resource.data !== undefined) {
            (<AnchorInterfaceComponent>componentRef.instance).data = this.resource.data;
            this.componentInstance.id = this.id;
        }
    }

    getComponentFormValue() {
        return this.componentInstance.exportFormValue();
    }

}
