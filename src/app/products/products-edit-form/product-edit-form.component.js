"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var product_model_1 = require("../../model/product.model");
var products_service_1 = require("../products.service");
var router_1 = require("@angular/router");
var ProductEditFormComponent = (function () {
    function ProductEditFormComponent(productsService, router, activeRoute) {
        var _this = this;
        this.productsService = productsService;
        this.router = router;
        this.product = new product_model_1.Product();
        this.formSubmitted = false;
        productsService.getProduct(activeRoute.snapshot.params["id"]).subscribe(function (data) { return _this.product = data; });
        productsService.getProductsTypes().subscribe(function (data) { return _this.productsTypes = data; });
    }
    ProductEditFormComponent.prototype.ngOnInit = function () {
    };
    ProductEditFormComponent.prototype.submitForm = function (form) {
        var _this = this;
        this.formSubmitted = true;
        if (form.valid) {
            this.productsService.saveProduct(this.product).subscribe(function (order) {
                _this.product = new product_model_1.Product();
                form.reset();
                _this.formSubmitted = false;
                _this.router.navigateByUrl('/product');
            }, function (err) { return console.log("error"); });
        }
    };
    return ProductEditFormComponent;
}());
ProductEditFormComponent = __decorate([
    core_1.Component({
        selector: 'product-edit-form',
        templateUrl: './product-edit-form.component.html',
    }),
    __metadata("design:paramtypes", [products_service_1.ProductsService, router_1.Router, router_1.ActivatedRoute])
], ProductEditFormComponent);
exports.ProductEditFormComponent = ProductEditFormComponent;
//# sourceMappingURL=product-edit-form.component.js.map