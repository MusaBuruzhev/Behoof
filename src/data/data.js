const catalogData = {
  categories: [
    {
      id: 'cat1',
      name: 'Смартфоны',
      subcategoryIds: ['sub1', 'sub2', 'sub3', 'sub4'],
    },
    {
      id: 'cat2',
      name: 'Ноутбуки',
      subcategoryIds: ['sub5', 'sub6'],
    },
    {
      id: 'cat3',
      name: 'Планшеты',
      subcategoryIds: [],
    },
  ],

  subcategories: {
    sub1: {
      id: 'sub1',
      name: 'Apple',
      productIds: ['p1', 'p2', 'p3'],
    },
    sub2: {
      id: 'sub2',
      name: 'Samsung',
      productIds: ['p4', 'p5', 'p6'],
    },
    sub3: {
      id: 'sub3',
      name: 'Xiaomi',
      productIds: ['p7', 'p8'],
    },
    sub4: {
      id: 'sub4',
      name: 'Все смартфоны',
      productIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
    },
    sub5: {
      id: 'sub5',
      name: 'Игровые ноутбуки',
      productIds: ['p9', 'p10'],
    },
    sub6: {
      id: 'sub6',
      name: 'Ультрабуки',
      productIds: ['p11', 'p12'],
    },
  },

  products: {
    p1: {
      id: 'p1',
      name: 'iPhone 14 Pro Max',
      price: 1299,
      brand: 'Apple',
    },
    p2: {
      id: 'p2',
      name: 'iPhone 13',
      price: 799,
      brand: 'Apple',
    },
    p3: {
      id: 'p3',
      name: 'iPhone SE',
      price: 429,
      brand: 'Apple',
    },
    p4: {
      id: 'p4',
      name: 'Galaxy S23 Ultra',
      price: 1199,
      brand: 'Samsung',
    },
    p5: {
      id: 'p5',
      name: 'Galaxy A54',
      price: 449,
      brand: 'Samsung',
    },
    p6: {
      id: 'p6',
      name: 'Galaxy Z Flip5',
      price: 999,
      brand: 'Samsung',
    },
    p7: {
      id: 'p7',
      name: 'Xiaomi 13 Pro',
      price: 899,
      brand: 'Xiaomi',
    },
    p8: {
      id: 'p8',
      name: 'Redmi Note 12',
      price: 299,
      brand: 'Xiaomi',
    },
    p9: {
      id: 'p9',
      name: 'ASUS ROG Strix G16',
      price: 1999,
      brand: 'ASUS',
    },
    p10: {
      id: 'p10',
      name: 'MSI Katana 17',
      price: 1499,
      brand: 'MSI',
    },
    p11: {
      id: 'p11',
      name: 'MacBook Air M2',
      price: 1199,
      brand: 'Apple',
    },
    p12: {
      id: 'p12',
      name: 'Dell XPS 13',
      price: 1099,
      brand: 'Dell',
    },
  },
}

export default catalogData
