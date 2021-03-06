import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BasketService} from "../basket.service";
import {NavigationEnd, Router} from "@angular/router";
import {Basket} from "../../model/basket.model";
import {ConfirmationService, DataTable, LazyLoadEvent, OverlayPanel, SelectItem} from "primeng/primeng";
import {BasketType} from "../../model/basket_type.model";
import {AuthenticationService} from "../../authentication.service";
import {AppConstants} from "../../constants";
import {ProductSubType} from "../../model/product_sub_type";
import {ProductsService} from "../../products/products.service";
import {SpinerService} from "../../spiner.service";
import {MessageServiceExt} from "../../messages/messageServiceExt";
import {RoutingState} from "../../routing-stage";
import {Order} from "../../model/order.model";

@Component({
	selector: 'app-basket',
	templateUrl: './basket-view.component.html',
	styleUrls: ['./basket-view.component.css']
})
export class BasketComponent
	implements OnInit,OnDestroy {
	public priceMin: number = 0;
	public priceMax: number = 9999;
	public baskets: Basket[] = [];
	public loading: boolean;
	public gb: any;
	public url: string = '';
	public imageToShow: any;
	public totalRecords: number;
	public showImageFrame: boolean = false;
	@ViewChild('onlyDeleted') el: ElementRef;
	@ViewChild('filterByProductsPrize') filterByProductsPrizeCheckBox: ElementRef;
	@ViewChild('op') overlayPanel: OverlayPanel;
	@ViewChild('dt') datatable: DataTable;
	public paginatorValues = AppConstants.PAGINATOR_VALUES;
	public productSubType: SelectItem[] = [];
	public selectedCategories: any[] = [];
	public expandedRowBasketId: number = 0;
	public selectedCategoriesIds: number[] = [];
	public basketSeasonList: SelectItem[] = [];
	public routerObserver = null;
	public findInputtext : string = '';
	public seasonMultiSelect: any;

	constructor(private messageServiceExt: MessageServiceExt, private spinerService: SpinerService,
				private productsService: ProductsService, private basketService: BasketService,
				public router: Router, private confirmationService: ConfirmationService,
				public authenticationService: AuthenticationService, private routingState :RoutingState ) {

		basketService
			.getBasketsPage(0,20,"","basketName", -1, false,[])
			.subscribe((data: any) => {
			this.baskets = data.basketsList;
			this.totalRecords = data.totalRowsOfRequest;
		});
		this.getBasketSeasonForDataTableFilter();
		productsService.getProductsSubTypes().subscribe((data: ProductSubType[]) => {
			data.forEach(value => {
				this.productSubType.push({
					value: value,
					label: value.subTypeName + " (" + value.productType.typeName + " )"
				});
			})
		});
		this.url = router.url;
	}

	ngOnInit() {
		this.checkIfUpdateOrderRowAfterRedirectFromOrderDetails();
	}

	ngOnDestroy() {
		this.routerObserver.unsubscribe();
	}

	private checkIfUpdateOrderRowAfterRedirectFromOrderDetails(){
		this.routerObserver =this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				console.log("TTTTTTTTTTTTTTT");
				if (this.routingState.getPreviousUrl().substr(0, 15) == '/basket/detail/') {
					let id = parseInt(this.routingState.getPreviousUrl().substr(15, this.routingState.getPreviousUrl().length));
					this.refreshOrderRowInDataTable(id);
				}
			}
		})

	}

	private refreshOrderRowInDataTable(id :number){
		this.basketService.getBasket(id).subscribe(data => {
			let index = this.baskets.findIndex((value: Basket) => {
				return value.basketId == id;
			});
			this.baskets[index] = data;
			this.baskets = this.baskets.slice(); //Tip to refresh PrimeNg datatable
		}, error => {
		}, () => {
			this.goToSavedScrollPosition();
		})
	}

	private goToSavedScrollPosition(){
		window.scrollTo(0, this.routingState.getlastScrollYPosition());
	}



	getBasketWithFilter() {
		this.datatable.lazy = false;
		this.spinerService.showSpinner = true;
		this.selectedCategories.forEach(value => {
			this.selectedCategoriesIds.push(value.subTypeId);
		});
		let filterByBasketTotalPrice: boolean = !this.filterByProductsPrizeCheckBox.nativeElement.checked;
		this.basketService
			.getBasketWithFilter(this.priceMin, this.priceMax, filterByBasketTotalPrice, this.selectedCategoriesIds)
			.subscribe(data => {
			this.baskets = data;
		}, error => {
			this.spinerService.showSpinner = false;
		}, () => {
			this.selectedCategoriesIds = [];
			setTimeout(() => {
				this.spinerService.showSpinner = false;
				;
			}, 500);
		})
	}

	redirectToBasketEdit(basketId : number){

		if(this.authenticationService.isAdmin() || this.authenticationService.isBiuroUser()){
			this.routingState.setlastScrollYPosition(window.scrollY);
			this.router.navigateByUrl('/basket/detail/' + basketId);
		}

	}

	editBasketStock(basket: Basket) {
		this.spinerService.showSpinner = true;
		this.basketService.saveNewStockOfBasket(basket.basketId, basket.stock).subscribe(
			value => {
				this.messageServiceExt.addMessageWithTime(
					'success', 'Status', 'Dokonano edycji stanu magazynowego koszy', 5000);
			},
			error => {
				this.messageServiceExt.addMessageWithTime
				('error', 'Błąd', "Status: " + error._body + ' ', 5000);
				this.spinerService.showSpinner = false;
			}, () => {
				this.spinerService.showSpinner = false;
			}
		)
	}

	loadBasketsLazy(event: LazyLoadEvent) {
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
			basketSeasonList = event.filters["basketSezon.basketSezonName"].value;
		}
		this.basketService
			.getBasketsPage(
				pageNumber, event.rows, event.globalFilter, sortField, event.sortOrder,false, basketSeasonList)
			.subscribe((data: any) => {
				this.baskets = data.basketsList;
				this.totalRecords = data.totalRowsOfRequest;
			}, null
			, () => {
				this.loading = false;
			})
	}

	rowExpand(event) {
		if (event.data) {
			this.expandedRowBasketId = event.data.basketId;
			let index;
			let dataTmp;
			this.basketService.getBasket(event.data.basketId).subscribe(data => {
				index = this.baskets.findIndex((value: Basket) => {
					return value.basketId == event.data.basketId;
				});
				dataTmp = data;
				this.baskets[index].basketItems = dataTmp.basketItems;
			})
		}
	}

	ShowConfirmModal(basket: Basket) {
		if (basket.basketType.basketTypeId == AppConstants.BASKET_TYPE_ID_USUNIETY ) {
			this.confirmationService.confirm({
				message: 'Jesteś pewny że chcesz trwale usunąć kosz ? ',
				accept: () => {
					basket.basketType = new BasketType(AppConstants.BASKET_TYPE_ID_ARCHWIUM);
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
					basket.basketType = new BasketType(AppConstants.BASKET_TYPE_ID_USUNIETY);
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
		this.datatable.lazy = true;
		this.loading = true;
		setTimeout(() => {
			this.clickOnlyDeletedBasketChceckBox();
			this.loading = false;
			this.cleanFilter();
		}, 1000);
	}

	private cleanFilter(){
		this.findInputtext='';
		this.priceMin = 0;
		this.priceMax =9999;
		this.selectedCategories = [];
		 this.filterByProductsPrizeCheckBox.nativeElement.checked = false;
		this.el.nativeElement.checked = false;
		this.seasonMultiSelect = [];

	}

	clickOnlyDeletedBasketChceckBox() {
		if (this.el.nativeElement.checked) {
			this.basketService
				.getBasketsPage(0, 20, "", "basketName", -1, true, [])
				.subscribe((data: any) => {
				this.baskets = data.basketsList;
				this.totalRecords = data.totalRowsOfRequest;
				setTimeout(() => {
					this.datatable.totalRecords = data.totalRowsOfRequest;
				}, 500);
			});
		} else {
			this.basketService
				.getBasketsPage(0, 20, "", "basketName", -1, false, [])
				.subscribe((data: any) => {
				this.baskets = data.basketsList;
				this.totalRecords = data.totalRowsOfRequest;
				setTimeout(() => {
					this.datatable.totalRecords = data.totalRowsOfRequest;
				}, 500);
			});
		}
		;
	}

	showBasketImg(event, basketId: number) {
		this.basketService.getBasketImg(basketId).subscribe(res => {
			this.createImageFromBlob(res);
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
				let fileURL = URL.createObjectURL(res);
				window.open(fileURL);
			}
		)
	}

	printProductListInBasketCatalogNameVersionPdf(basketId: number) {
		this.basketService.getBasketPdfCatalogNameVersion(basketId).subscribe(res => {
				let fileURL = URL.createObjectURL(res);
				window.open(fileURL);
			}
		)
	}
}
