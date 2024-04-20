"use strict";

const uniqueArr = (arr) => {
  let unique = []; // Mảng lưu trữ các phần tử duy nhất

  for (let i = 0; i < arr.length; i++) {
    if (unique.indexOf(arr[i]) === -1) {
      unique.push(arr[i]); // Thêm phần tử vào mảng unique nếu chưa tồn tại
    }
  }
  return unique;
};

const getURLString = (str) => {
  let arr = str.split("?");
  return arr.shift();
};

// Category and Search webpage
if (
  window.location.href.includes("/category/") ||
  window.location.href.includes("/w/")
) {
  // create button import  all products
  const importAllBtn = document.createElement("button");
  importAllBtn.textContent = "Import All products";
  importAllBtn.classList.add("import-all-btn");
  document.body.appendChild(importAllBtn);

  // create button import only ePacket shipping
  const importEpacketShipping = document.createElement("button");
  importEpacketShipping.textContent = "Import only ePacket shipping";
  importEpacketShipping.classList.add("import-epacket-shipping-btn");
  document.body.appendChild(importEpacketShipping);

  const enableSingleSelectBtn = document.createElement("button");
  enableSingleSelectBtn.textContent = "Enable Single Selection";
  enableSingleSelectBtn.classList.add("enable-single-select-btn");
  document.body.appendChild(enableSingleSelectBtn);

  const importWaitingListBtn = document.createElement("button");
  importWaitingListBtn.textContent = "Import waiting List";
  importWaitingListBtn.classList.add("import-waiting-list-btn");
  document.body.appendChild(importWaitingListBtn);

  const listProductsXPath =
    "/html/body/div[5]/div[1]/div/div[2]/div/div[2]/div[3]";

  const listProducts = document.evaluate(
    listProductsXPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  let listProductsElement;
  listProductsElement = listProducts.singleNodeValue;
  let childElements = [];
  let listUrlProducts = [];
  let waitingList = [];
  let count = 0;
  let isEnableSingleSelection = false;

  for (let node of listProductsElement.childNodes) {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node.children.length > 0 || node.hasAttribute("href"))
    ) {
      childElements.push(node);
    }
  }

  for (let i = 0; i < childElements.length; i++) {
    if (childElements[i].getAttribute("href"))
      listUrlProducts.push(childElements[i].getAttribute("href"));
  }

  const getVisibleChildElements = () => {
    listProductsElement = listProducts.singleNodeValue;
    for (let node of listProductsElement.childNodes) {
      if (
        node.nodeType === Node.ELEMENT_NODE &&
        (node.children.length > 0 || node.hasAttribute("href"))
      ) {
        childElements.push(node);
      }
    }

    return uniqueArr(childElements);
  };

  const clickToEnable = () => {
    const data = childElements.filter((els) => {
      return isContainClass(els);
    });
    if (data.length < 1) {
      childElements.forEach((product) => {
        if (!isContainClass(product)) {
          const addToWaitingBtn = document.createElement("button");
          const plusIcon = document.createElement("span");
          const textAdd = document.createElement("span");
          textAdd.innerText = "Add to waiting list";
          addToWaitingBtn.classList.add("add-waiting-list-btn");
          plusIcon.classList.add("circle");
          product.appendChild(addToWaitingBtn);
          addToWaitingBtn.appendChild(plusIcon);
          addToWaitingBtn.appendChild(textAdd);
          addToWaitingBtn.addEventListener("click", (event) => {
            const parentElment = addToWaitingBtn.parentElement;
            const href = parentElment.getAttribute("href");
            addToWaitingList(event, href);
          });
        }
      });
    }
  };

  const isContainClass = (parent) => {
    // Lấy tất cả các phần tử con của phần tử cha
    const children = parent.children;
    return (
      children &&
      [...children].some((el) => {
        return el.className === "add-waiting-list-btn";
      })
    );
  };

  window.addEventListener("scroll", () => {
    const visibleChildElements = getVisibleChildElements();
    let linkProducts = [];
    // Do something with the visible child elements
    for (let i = 0; i < visibleChildElements.length; i++) {
      if (visibleChildElements[i].getAttribute("href"))
        linkProducts.push(
          `https:${getURLString(visibleChildElements[i].getAttribute("href"))}`
        );
    }

    listUrlProducts = [...uniqueArr(linkProducts)];

    if (isEnableSingleSelection) {
      visibleChildElements.forEach((product) => {
        if (!isContainClass(product)) {
          const addToWaitingBtn = document.createElement("button");
          const plusIcon = document.createElement("span");
          const textAdd = document.createElement("span");
          textAdd.innerText = "Add to waiting list";
          addToWaitingBtn.classList.add("add-waiting-list-btn");
          plusIcon.classList.add("circle");
          product.appendChild(addToWaitingBtn);
          addToWaitingBtn.appendChild(plusIcon);
          addToWaitingBtn.appendChild(textAdd);
          addToWaitingBtn.addEventListener("click", (event) => {
            const parentElment = addToWaitingBtn.parentElement;
            const href = parentElment.getAttribute("href");
            addToWaitingList(event, href);
          });
        }
      });
    }
  });

  const addToWaitingList = (event, href) => {
    event.preventDefault();
    toggleButton(href, count);
  };

  function toggleButton(href, preCount) {
    if (importWaitingListBtn.style.display === "block") {
      if (href && !waitingList.includes(`https:${getURLString(href)}`)) {
        waitingList.push(`https:${getURLString(href)}`);
        const uniqueCount = uniqueArr(waitingList).length;
        count = uniqueCount;
      }
    } else {
      importWaitingListBtn.style.display = "block";
      waitingList.push(`https:${getURLString(href)}`);
      count += 1;
    }
    if (preCount < count) {
      const countWaitingList = document.querySelector(".count-waiting-list");
      if (countWaitingList) {
        countWaitingList.textContent = `${count}`;
      } else {
        const countWaitingList = document.createElement("span");
        countWaitingList.classList.add("count-waiting-list");
        countWaitingList.textContent = `${count}`;
        importWaitingListBtn.appendChild(countWaitingList);
      }
    }
  }

  const BASE_URL = "http://localhost:5001";
  const loaderStyle = `
  .loader-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  .loader {
    border: 16px solid #f3f3f3;
    border-radius: 50%;
    border-top: 16px solid rgb(41, 128, 185);
    border-bottom: 16px solid rgb(41, 128, 185);
    width: 120px;
    height: 120px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }

  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  #toastContainer {
    position: fixed;
    top: 20px;
    left: 20px;
    width: 300px;
    height: 25px;
    z-index: 99999;
  }
  
  .toast {
    background-color: rgb(41, 128, 185);
    color: #fff;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 10px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    margin-bottom: 20px;
  }
  
  .toast.show {
    opacity: 1;
  }
`;

  const styleElement = document.createElement("style");
  styleElement.innerHTML = loaderStyle;
  document.head.appendChild(styleElement);

  const showLoading = () => {
    const loaderContainer = document.createElement("div");
    loaderContainer.classList.add("loader-container");

    const loader = document.createElement("div");
    loader.classList.add("loader");

    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);
  };

  const hideLoading = () => {
    const loader = document.querySelector(".loader-container");
    if (loader) {
      loader.remove();
    }
  };

  const createToast = (message) => {
    // Create toast element
    var toastContainer = document.createElement("div");
    var toast = document.createElement("div");
    toastContainer.id = "toastContainer";
    toast.className = "toast";
    toast.innerHTML = message;

    // Append toast to container
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    // Show toast
    setTimeout(function () {
      toast.classList.add("show");
    }, 100);

    // Hide toast after 3 seconds
    setTimeout(function () {
      toast.classList.remove("show");

      // Remove toast from container
      setTimeout(function () {
        document.body.removeChild(toastContainer);
      }, 300);
    }, 3000);
  };

  const showErrorPopup = () => {
    createToast("Có lỗi xảy ra");
  };

  const showPopupSuccess = () => {
    createToast("Thêm sản phẩm thành công");
  };
  const sendAllData = async (urls) => {
    for (const url of urls) {
      try {
        // Show loading indicator here
        showLoading();

        const response = await fetch(`${BASE_URL}/crawl`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url }),
        });

        if (response.ok) {
          console.log(`API call to ${url} successful`);
          // hiển thị message thành công
          hideLoading();
          showPopupSuccess();
        } else {
          console.error(
            `API call to ${url} failed with status ${response.status}`
          );
          // hiển thị message lỗi
          hideLoading();
          // Display error popup
          showErrorPopup();
        }
      } catch (error) {
        console.error(`API call to ${url} failed with error: ${error}`);
        // hiển thị message lỗi
        hideLoading();
        // Display error popup
        showErrorPopup();
      }
    }
    const count = document.querySelector(".count-waiting-list");
    importWaitingListBtn.removeChild(count);
    waitingList = [];
  };

  // Thêm sự kiện click cho button để hiển thị thông báo
  importAllBtn.addEventListener("click", () => {
    console.log("listUrlProducts", listUrlProducts);
    sendAllData(listUrlProducts);
  });

  enableSingleSelectBtn.addEventListener("click", () => {
    if (!isEnableSingleSelection) {
      isEnableSingleSelection = true;
    }
    clickToEnable();
  });

  importWaitingListBtn.addEventListener("click", () => {
    console.log("waitingList", waitingList);
    if (waitingList.length > 0) sendAllData(waitingList);
  });
}

// Detail Product webpage
if (window.location.href.includes("/item/")) {
  // Đây là trang chi tiết sản phẩm
  const importToShop = document.createElement("button");
  importToShop.classList.add("import-to-shop-btn");
  importToShop.textContent = "Import To Shop";
  document.body.appendChild(importToShop);

  const productCustomization = document.createElement("div");
  productCustomization.classList.add("product-custom-modal");
  document.body.appendChild(productCustomization);

  importToShop.addEventListener("click", () => {
    productCustomization.style.display = "block";
  });
}
