import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {BasketService} from "../basket.service";
import {Router} from "@angular/router";
import {Basket} from "../../model/basket.model";
import {ConfirmationService, DataTable, LazyLoadEvent, OverlayPanel, SelectItem} from "primeng/primeng";
import {BasketType} from "../../model/basket_type.model";
import {AuthenticationService} from "../../authentication.service";
import {AppConstans} from "../../constans";
import {ProductSubType} from "../../model/product_sub_type";
import {ProductsService} from "../../products/products.service";
import {SpinerService} from "../../spiner.service";
import {getPluralCategory} from "@angular/common/src/i18n/localization";
import {MessageServiceExt} from "../../messages/messageServiceExt";


@Component({
	selector: 'app-basket',
	templateUrl: './basket-view.component.html',
	styleUrls: ['./basket-view.component.css']
})
export class BasketComponent implements OnInit {
	public priceMin: number = 0;
	public priceMax: number= 9999;
	public baskets: Basket[] = [];
	public loading: boolean;
	public gb: any;
	public url: string = '';
	public imageToShow: any;
	public totalRecords: number;
	public showImageFrame: boolean = false;
	@ViewChild('onlyDeleted') el: ElementRef;
	@ViewChild('op') overlayPanel: OverlayPanel;
	@ViewChild('dt') datatable: DataTable;
	public paginatorValues = AppConstans.PAGINATOR_VALUES;
	public productSubType: SelectItem[]=[];
	public selectedCategories : any[]=[];
	public selectedCategoriesIds : number[]=[];
	public basketSeasonList: SelectItem[] = [];

	constructor(private messageServiceExt: MessageServiceExt,private spinerService :SpinerService ,private productsService :ProductsService, private basketService: BasketService, public router: Router, private confirmationService: ConfirmationService, public authenticationService: AuthenticationService) {
		basketService.getBasketsPage(1,20,"","basketName",-1,false,[]).subscribe((data :any) => {
			this.baskets = data.basketsList;
			this.totalRecords = data.totalRowsOfRequest;
		});

		this.getBasketSeasonForDataTableFilter();
		productsService.getProductsSubTypes().subscribe((data: ProductSubType[]) => {
			data.forEach(value => {
				this.productSubType.push({value: value , label: value.subTypeName + " (" + value.productType.typeName + " )"});


			})
		});
		this.url = router.url;
	}

	ngOnInit() {
	}

	getBasketWithFilter(){
		this.spinerService.showSpinner=true;

		this.selectedCategories.forEach(value => {
			this.selectedCategoriesIds.push(value.subTypeId);
		});


		this.basketService.getBasketWithFilter(this.priceMin, this.priceMax,this.selectedCategoriesIds).subscribe(data =>{
			this.baskets = data;


		},error => {
			this.spinerService.showSpinner=false;
		},() => {
			this.selectedCategoriesIds =[];
			setTimeout(() => {
				this.spinerService.showSpinner=false;    ;
			}, 500);

		})
	}



	editBasketStock(basket: Basket) {
		this.spinerService.showSpinner = true;
		this.basketService.saveNewStockOfBasket(basket.basketId, basket.stock).subscribe(
			value => {
				this.refreshData();
				this.messageServiceExt.addMessageWithTime('success', 'Status', 'Dokonano edycji stanu magazynowego koszy', 5000);
			},
			error => {
				this.messageServiceExt.addMessageWithTime('error', 'Błąd', "Status: " + error._body + ' ', 5000);
			}
		)
	}

	loadBasketsLazy(event: LazyLoadEvent) {
		
console.log(event);

		this.loading = true;
		let pageNumber = 0;
		if (event.first) {
			pageNumber = event.first / event.rows;
		}
		let sortField = event.sortField;

		if (sortField == undefined) {
			sortField = "basketName";
		}

		let basketSeasonList: any[] = [];
		if (event.filters != undefined && event.filters["basketSezon.basketSezonName"] != undefined) {
			basketSeasonList= event.filters["basketSezon.basketSezonName"].value;
		}




		this.basketService.getBasketsPage(pageNumber,event.rows,event.globalFilter,sortField,event.sortOrder,false,basketSeasonList).subscribe((data: any) => {
				this.baskets = data.basketsList;
				this.totalRecords = data.totalRowsOfRequest;
			}, null
			, () => {
				this.loading = false;
			})
	}

	ShowConfirmModal(basket: Basket) {
		if (basket.basketType.basketTypeId == 99) {
			this.confirmationService.confirm({
				message: 'Jesteś pewny że chcesz trwale usunąć kosz ? ',
				accept: () => {
					let tmpBaskettype: BasketType = new BasketType(999);
					basket.basketType = tmpBaskettype;
					this.basketService.saveBasketWithoutImg(basket).subscribe(data => {
						this.refreshData();
					});
				},
				reject: () => {
				}
			});
		} else {
			this.confirmationService.confirm({
				message: 'Jesteś pewny że chcesz przenieś kosz  ' + basket.basketName + ' do archiwum ?',
				accept: () => {
					let tmpBaskettype: BasketType = new BasketType(99);
					basket.basketType = tmpBaskettype;
					this.basketService.saveBasketWithoutImg(basket).subscribe(data => {
						this.refreshData();
					});
				},
				reject: () => {
				}
			});
		}
	}


	refreshData() {

		// this.basketService.getBaskets().subscribe(data => {
		// 	this.baskets = data
		// }, error => {
		// 	this.spinerService.showSpinner = false;
		// }, () => {
		// 	this.spinerService.showSpinner = false;
		// });

		this.loading = true;
		setTimeout(() => {
			this.clickOnlyDeletedBasketChceckBox();
			this.loading = false;
		}, 1000);
	}



	clickOnlyDeletedBasketChceckBox() {
		
		console.log(this.datatable);

		if (this.el.nativeElement.checked) {
			this.basketService.getBasketsPage(1,50,"","basketName",1,true,[]).subscribe((data :any) => this.baskets = data.basketsList);
		} else {
			this.basketService.getBasketsPage(1,50,"","basketName",1,false,[]).subscribe((data :any) => this.baskets = data.basketsList);
		}
	}

	showBacketImg(event, basketId: number) {
		this.basketService.getBasketImg(basketId).subscribe(res => {
			this.createImageFromBlob(res);
		}, error => {
		}, complete => {
		});
		this.showImageFrame = true;
	}

	private getBasketSeasonForDataTableFilter() {
		this.basketService.getBasketSeason().subscribe(data => {
			data.forEach(value => {
				this.basketSeasonList.push({label: '' + value.basketSezonName, value: value.basketSezonId});
			});
		});
	}

	private createImageFromBlob(image: Blob) {
		let reader = new FileReader();
		reader.addEventListener("load", () => {
			this.imageToShow = reader.result;
		}, false);
		if (image) {
			reader.readAsDataURL(image);
		}
	}

	printProductListInBasketPdf(basketId: number) {
		this.basketService.getBasketPdf(basketId).subscribe(res => {
				var fileURL = URL.createObjectURL(res);
				window.open(fileURL);
			}
		)
	}
}
