import { Producto } from "./classes.js";


window.onload = () => {
    if (!JSON.parse(localStorage.getItem('usuario'))) {
        document.body.innerHTML = ` `;
        window.location.replace('./login.html')
    }

    const sesion = JSON.parse(localStorage.getItem('usuario'));

    if (!sesion) {
        return;
    } else {
        document.getElementById('navNoSesion').classList.add('hidden');
        document.getElementById('navSesion').classList.remove('hidden');
        document.getElementById('navDropDownNoSession').classList.add('hidden');
        document.getElementById('navDropDownSession').classList.remove('hidden');
        if (sesion.name === 'admin') {
            document.getElementById('navAdminOption').classList.remove('hidden');
            document.getElementById('navDropDownSessionAdmin').classList.remove('hidden');
        }
    }
}

document.querySelectorAll('.logOut').forEach((e) => {
    e.addEventListener('click', () => {
        localStorage.removeItem('usuario');
        location.replace('./index.html');
    })
})

document.getElementById('btnNavToggle').addEventListener('click', () => {
    const navDropDown = document.getElementById('navDropDown');
    if (navDropDown.className.includes('hidden')) {
        navDropDown.classList.remove('hidden');
        navDropDown.classList.add('animate__animated', 'animate__fadeInDown');
    } else {
        navDropDown.classList.remove('animate__fadeInDown');
        navDropDown.classList.add('animate__animated', 'animate__fadeOutUp');
        setTimeout(() => {
            navDropDown.classList.add('hidden');
            navDropDown.classList.remove('animate__fadeOutUp');
        }, 550);
    }
});

handleCategories();
displayProduct();


/* ============================================
    FUNCIONES CONTROLADORES
    ===========================================
*/

//Obtener Categorias
function handleCategories() {

    const productList = JSON.parse(localStorage.getItem('productos'));

    //Lista de Categorias Existentes
    const categoryList = productList.map(p => p.category);
    const newCategory = [...new Set(categoryList)];

    document.getElementById('newProductCategory').innerHTML = `
    ${newCategory.map(c => `<option value="${c}"> ${c} </option>`)}
    <option value="createNewCategoryProduct"> Agregar Categoria </option>
    `

}

//Preview IMG
function handleImage(event) {
    //Recupero datos
    if (event.target.getAttribute("id") === 'newProductImgFile') {
        console.log('a')
        const file = event.target.files[0]
        if (!file) return;

        //Api FileReader
        const reader = new FileReader();
        reader.onload = function (event) {
            //Buscamos la img con la etiqueta imgPreview para actualizarla
            const imgPreview = document.getElementById('newProductImgPreview');
            imgPreview.src = event.target.result;
        }
        reader.readAsDataURL(file);
    } else {
        console.log('b')
        const file = event.target.files[0]
        if (!file) return;

        //Api FileReader
        const reader = new FileReader();
        reader.onload = function (event) {
            //Buscamos la img con la etiqueta imgPreview para actualizarla
            const imgPreview = document.getElementById('imgPreview');
            imgPreview.src = event.target.result;
        }

        reader.readAsDataURL(file);
    }

}


/* ============================================
    CREAR PRODUCTO FUNCIONES
    ===========================================
*/

//Detectar Img para llamar a la preview
document.getElementById('newProductImgFile').addEventListener('change', handleImage);



// Función para abrir ventana emergente de creación de nuevo producto
document.getElementById('btnOpenCreateProduct').addEventListener('click', function () {
    document.getElementById('createProductModal').classList.remove('hidden');
});

// Función para cerrar ventana emergente de creación de nuevo producto
document.getElementById('btnCloseCreateModal').addEventListener('click', function () {
    document.getElementById('createProductModal').classList.add('hidden');
});

//Funcion para detectar si se va a crear una nueva categoria
document.querySelector('#newProductCategory').addEventListener('change', () => {

    const newCategorySelect = document.querySelector('#newCategoryInput');

    if (document.querySelector('#newProductCategory').value == 'createNewCategoryProduct') {
        newCategorySelect.classList.remove('hidden');

    } else {
        newCategorySelect.classList.add('hidden');
    }

});

//Btn Para crear el producto
document.getElementById('btnNewProduct').addEventListener('click', () => { AddProduct(); });

function AddProduct() {

    //products
    const productList = JSON.parse(localStorage.getItem('productos'));

    //Inputs
    const name = document.getElementById('newProductName').value;
    const description = document.getElementById('newProductDescripcion').value;
    const price = parseFloat(document.getElementById('newProductPrice').value);
    const stock = parseInt(document.getElementById('newProductStock').value);
    const category = document.getElementById('newProductCategory').value;

    let newCategory;

    if (category === 'createNewCategoryProduct') {
        newCategory = document.getElementById('newCategoryName').value;
    } else {
        newCategory = category;
    }

    console.log(newCategory)
    //Obtenemos la direccion de la imgPreview
    const imgUrl = document.getElementById('newProductImgPreview').src;

    //Comprobamos que no esten vacios los inputs
    if (!name || !description || !imgUrl || isNaN(price) || isNaN(stock) || !newCategory) {
        alert('Completa todos los campos');
        return;
    }

    if (productList.find(p => p.name == name)) {
        alert('Ya existe');
        return;
    }

    const newProduct = new Producto(name, description, imgUrl, price, stock, newCategory);
    productList.push(newProduct);
    alert('Producto Agregado Correctamente');
    localStorage.setItem('productos', JSON.stringify(productList));
    document.getElementById('productListContainer').innerHTML = ' ';
    displayProduct(JSON.parse(localStorage.getItem('productos')));
    document.getElementById('createProductModal').classList.add('hidden');
}


/* ============================================
    LISTAR Y BUSCAR PRODUCTOS FUNCIONES
===========================================
*/

//Esperar evento del btn buscar
document.getElementById('btnFind').addEventListener('click', () => { findProduct(); });

//Funcion para buscar productos
function findProduct() {
    const input = document.getElementById('nameProduct').value.toLowerCase();

    const productList = JSON.parse(localStorage.getItem('productos'))

    const res = productList.filter(p => {
        return p.name.toLowerCase().includes(input) || p.id.toString().includes(input) || p.description.toString().includes(input);
    })

    displayProduct(res);
}

//Funcion para mostrar Productos
function displayProduct(res) {

    let productList = [];

    if (res) {
        productList = res;
    } else {
        productList = JSON.parse(localStorage.getItem('productos')) 
    }

    //Obtenemos el contenedor principal
    const categoriesContainer = document.getElementById('productListContainer');
    categoriesContainer.innerHTML = ` `

    //Creo una array vacia en la cual guardare todas mis categorias
    const categoriesList = {};

    //recorriendo la lista de productos y obteniendo la lista de productos de cada categoria
    productList.forEach(p => {
        if (!categoriesList[p.category]) {
            categoriesList[p.category] = [];
        }
        categoriesList[p.category].push(p);
    });

    //Recorremos todas las categorias de mi lista 
    for (const category in categoriesList) {
        //Comprobamos que el objeto que obtenemos tenga el mismo valor en categoria
        if (categoriesList.hasOwnProperty(category)) {

            //Guardamos los productos
            const products = categoriesList[category];

            //Creamos un div que sera el contenedor de nuestra categoria
            const categoryContainer = document.createElement('div');
            categoryContainer.innerHTML = `
            <h2 class=" py-4">
                <span class=" text-3xl font-semibold md:text-4xl text-pantone">
                    ${category}
                </span>
            </h2>`;

            //añadimos estilo a nuestro contenedor
            categoryContainer.classList.add('p-2', 'bg-black');

            const productContainer = document.createElement('div');
            productContainer.classList.add('flex', 'gap-x-4', 'overflow-scroll', 'productContainer');

            //Recorremos todos nuestros productos
            products.forEach(producto => {

                //creamos un div por producto
                const productoElement = document.createElement('div');

                //Añadimos estilos
                productoElement.classList.add('relative', 'bg-pantone_gunpowder', 'producto', 'text-white', 'h-[32rem]');

                //Creamos el btn para añadir al carrito
                const btnEditProduct = document.createElement('button');
                //Damos estilos
                btnEditProduct.classList.add('btnEditProduct', 'absolute', 'bottom-0', 'top-[90%]', 'left-0', 'right-0', 'py-2', 'px-1', 'bg-pantone', 'text-pantone_gunpowder', 'font-bold');
                //Colocamos un evento
                btnEditProduct.addEventListener("click", () => {
                    document.getElementById('editProductModal').classList.remove('hidden');
                    editProduct(producto.id);
                });
                btnEditProduct.textContent = `Editar Producto`;


                productoElement.innerHTML = `
                <div class=" w-52 h-52 flex-shrink-0">
                    <img class=" w-full h-full object-cover" src="${producto.imgUrl}" alt="">
                </div>
                <h3 class="mb-2 mt-2 text-pantone ">${producto.name}</h3>
                <p class="text-sm mb-2 w-52">${producto.description}</p>
                <p><span class="text-pantone">Precio:</span> $${producto.price}</p>
                <p><span class="text-pantone">Stock:</span> ${producto.stock}</p>

                `;
                productoElement.appendChild(btnEditProduct);
                productContainer.appendChild(productoElement);
                categoryContainer.appendChild(productContainer);
            });

            categoriesContainer.appendChild(categoryContainer);
        }
    }
}


/* ============================================
    EDITAR PRODUCTO FUNCIONES
===========================================
*/

document.getElementById('newProductImgFile').addEventListener('change', handleImage);

let thisForm = null;
function editProduct(id) {

    if (thisForm) {
        thisForm.remove();
    }

    //Lista de Productos
    let productList = JSON.parse(localStorage.getItem('productos'));

    //Lista de Categorias Existentes
    const categoryList = productList.map(p => p.category);
    const newCategory = [...new Set(categoryList)];

    //Buscamos por ID
    const product = productList.find(p => p.id === id);


    const form = document.createElement('div');
    form.innerHTML = `
            <div class="bg-white p-6 rounded-md max-w-lg mt-[8.5rem]">
                <h2 class="text-lg font-semibold mb-4">Editar Producto</h2>
                    <!--Aquí va el formulario de edición de producto -->
                <div>
                    <input id="name" type="text" value="${product.name}" class="w-full px-4 py-2 border rounded-md mb-2">
                    <textarea id="description"
                        class="w-full px-4 py-2 border rounded-md mb-2">${product.description}</textarea>
                    <input id="price" type="number" value="${product.price}"
                        class="w-full px-4 py-2 border rounded-md mb-2">
                    <input id="stock" type="number" value="${product.stock}"
                        class="w-full px-4 py-2 border rounded-md mb-2">
                    <select id="editCategory" required class="w-full px-4 py-2 border rounded-md mb-2">
                        ${newCategory.map(c => `<option value="${c}"> ${c} </option>`)}
                        <option value="newCategory">Agregar Categoria</option>
                    </select>
                    <div id="editCategoryInput">
                        <input id="newCategory" type="text" required class="w-full px-4 py-2 border rounded-md mb-2">
                    </div>
                    <div class="" id="imgContainer">
                        <div id="imgPreviewContainer" class="w-24 h-24 flex-shrink-0 ">
                        </div>
                    </div>
                </div>
                <button id="btnUpdateProduct" class="px-4 py-2 bg-blue-500 text-white rounded-md mt-4">Actualizar</button>
                <button id="btnDeleteProduct" class="px-4 py-2 bg-red-500 text-white rounded-md mt-4">Eliminar Producto</button>
                <button id="btnCloseEditModal" class="px-4  py-2 bg-gray-500 text-white rounded-md mt-4 ml-2">Cerrar</button>
            </div>
`

    const imgFile = document.createElement('input')
    imgFile.setAttribute('type', 'file');
    imgFile.setAttribute('id', 'imgFile');
    imgFile.addEventListener('change', (e) => { handleImage(e) });
    imgFile.classList.add('w-64');

    const imgPreview = document.createElement('img');
    imgPreview.setAttribute('id', 'imgPreview');
    imgPreview.src = product.imgUrl;
    imgPreview.classList.add('w-full', 'h-full', 'object-cover');


    const categorySelect = form.querySelector('#editCategory');
    categorySelect.value = `${product.category}`
    const newCategorySelect = form.querySelector('#editCategoryInput');
    newCategorySelect.classList.add('hidden');

    categorySelect.addEventListener('change', () => {
    
        if (categorySelect.value == 'newCategory') {
            newCategorySelect.classList.remove('hidden');
        } else {
            newCategorySelect.classList.add('hidden');
        }
    });
    

    form.appendChild(imgFile);
    form.appendChild(imgPreview);
    const container = document.getElementById('editProductModal');
    container.insertBefore(form, container.firstChild);
    thisForm = form;
    document.getElementById('imgContainer').appendChild(imgFile);
    document.getElementById('imgPreviewContainer').appendChild(imgPreview);

    const btnUpdateProduct = document.getElementById('btnUpdateProduct');

    const btnDeleteProduct = document.getElementById('btnDeleteProduct');

    const btnCloseEditModal = document.getElementById('btnCloseEditModal');

    btnCloseEditModal.addEventListener('click', function () {
        document.getElementById('editProductModal').classList.add('hidden');
    });

    btnUpdateProduct.addEventListener('click', () => {
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const price = parseFloat(document.getElementById('price').value);
        const stock = parseInt(document.getElementById('stock').value);
        const categorySelect = document.getElementById('editCategory').value;
        const imgUrl = document.getElementById('imgPreview').src;

        let newCategory;

        if (categorySelect === 'newCategory') {
            newCategory = document.getElementById('newCategory').value;
        } else {
            newCategory = categorySelect;
        }


        const index = productList.findIndex(p => p.id === id);
        if (index !== -1) {
            productList[index].name = name;
            productList[index].description = description;
            productList[index].price = price;
            productList[index].stock = stock;
            productList[index].category = newCategory;
            productList[index].imgUrl = imgUrl;
            localStorage.setItem('productos', JSON.stringify(productList));
            displayProduct(JSON.parse(localStorage.getItem('productos')));
        } else {
            alert("El producto no se encontro")
        }

        document.getElementById('editProductModal').classList.add('hidden');;
    })

    btnDeleteProduct.addEventListener('click', () => {
        const Index = productList.findIndex(p => p.id === id);
        productList.splice(Index, 1);
        localStorage.setItem('productos', JSON.stringify(productList))
        displayProduct(JSON.parse(localStorage.getItem('productos')));
        document.getElementById('editProductModal').classList.add('hidden');
    })

    thisForm = form;
}