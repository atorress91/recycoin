import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Product } from '@app/core/models/product-model/product.model';
import { CartService } from '@app/core/service/cart.service/cart.service';
import { ProductService } from '@app/core/service/product-service/product.service';


@Component({
  selector: 'app-academy',
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.scss']
})
export class AcademyComponent implements OnInit {
  products: Product[] = []

  constructor(private productService: ProductService, private toast: ToastrService, private cartService: CartService) { }

  ngOnInit(): void {
    this.loadProduct();
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.showError(message);
  }

  loadProduct() {
    this.productService.getAllTradingAcademy().subscribe({
      next: (value: Product[]) => {
        this.products = value;
        this.products.forEach((item: any) => {
          Object.assign(item, { quantity: 1, total: item.salePrice });
        });
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  // addtocart(item: any) {
  //   this.cartService.addtoCart(item);
  // }
}
