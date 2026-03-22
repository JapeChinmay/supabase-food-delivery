export interface Restaurant {
     id:string
     name :string
     cuisine:string
     rating:number
     delivery_time:number
     image_url:string
     is_open:boolean
}

export interface MenuItem {
      
      id:string
      restaurant_id:string
      name:string
      description:string 
      price:number
      category:string 
      image_url:string
      is_available:boolean

}

export interface CartItem extends MenuItem{
      quantity:number
}


export interface Order {

      id:string
      user_id:string
      restaurant_id:string
      items:CartItem[]
      total:number
      status: 'placed' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered'
      created_at: string
}