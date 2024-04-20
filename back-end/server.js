const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
require("dotenv").config();
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const app = express();
// Enable CORS for all routes
app.use(cors());

const PORT = process.env.PORT || 3000;

const wooCommerceApi = new WooCommerceRestApi({
  url: "http://localhost/wordpress/",
  consumerKey: "ck_3c2bb17a8f5eb787ce7467d33e32d38db5c2156c",
  consumerSecret: "cs_4bbacc582da33da8f4148b9917b5511099ca2474",
  version: "wc/v3",
});

// sử dụng middleware body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// tạo route POST
app.post("/crawl", async (req, res) => {
  const url = req.body.url;

  // Hàm crawl dữ liệu từ URL sử dụng Puppeteer
  async function crawlData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Trích xuất dữ liệu từ trang web

    const title = await page.evaluate(() => {
      const element = document.querySelector(".product-title-text");
      return element ? element.textContent : "null";
    });

    const price = await page.evaluate(() => {
      const bannerPrice = document.querySelector(".uniform-banner-box-price");

      const elements = Array.from(
        document.querySelectorAll(".product-price-value")
      );
      const priceElement = elements.find((el) => el.textContent);

      if (bannerPrice) {
        return bannerPrice.textContent.trim();
      } else if (priceElement) {
        return priceElement.textContent.trim();
      }
      return "Not patched.";
    });

    const materials = await page.$$eval(".sku-property-text", (els) =>
      els.map((el) => {
        const name = el.querySelector("span");
        if (name) return name.textContent;
      })
    );

    const colors = await page.$$eval(".sku-property-image", (els) =>
      els.map((el) => {
        const src = el.querySelector("img").src;
        const title = el.querySelector("img").title;
        return {
          src,
          title,
        };
      })
    );

    const attributes = await page.$$eval(".sku-property", (els) =>
      els.map((el) => {
        let options = [];
        let title = "";
        const name = el.querySelector(".sku-title");
        if (name) {
          title = name.textContent;
        }
        if (el.querySelector(".sku-property-text")) {
          options = el.querySelectorAll(".sku-property-text", (els) =>
            els.map((el) => {
              const name = el.querySelector("span");
              if (name) return name.textContent;
            })
          );
        }

        if (el.querySelector(".sku-property-image")) {
          options = el.querySelectorAll(".sku-property-image", (els) =>
            els.map((el) => {
              const name = el.querySelector("img");
              if (name) return name.title;
            })
          );
        }
      })
    );

    console.log("attributes", attributes);
    // Lấy thông tin về giá và màu sắc của sản phẩm

    const images = await page.$$eval(".images-view-item", (els) =>
      els.map((el) => {
        const src = el.querySelector("img").src;
        return {
          src,
        };
      })
    );

    await browser.close();

    return {
      title,
      price,
      images,
      colors,
      materials,
      attributes,
    };
  }

  if (url) {
    try {
      crawlData(url).then((data) => {
        const { title, price, images, colors, materials, attributes } = data;

        const productData = {
          name: title,
          regular_price: price,
          images,

          // Các thuộc tính khác tùy theo yêu cầu
        };

        // Gửi yêu cầu tạo sản phẩm mới vào WordPress
        wooCommerceApi
          .post("products", productData)
          .then((response) => {
            console.log("Product created:", response.data);
            // Thực hiện các công việc khác sau khi sản phẩm được tạo thành công
            res.json({
              success: true,
              message: "Product created successfully",
            });
          })
          .catch((error) => {
            console.log("Error creating product:", error.response.data);
            // Xử lý lỗi nếu có
            res.json({ success: false, message: "Error creating product" });
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong." });
    }
  }
  // do something with data
});

app.get("/", (req, res) => {
  res.send("Hello GET");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
