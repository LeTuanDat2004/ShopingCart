/* eslint-disable no-param-reassign */ // Cho phép thay đổi thuộc tính của tham số (ví dụ: cartProduct.quantity++)
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();

// --- Cấu hình và Hằng số ---
const port = process.env.PORT || 3000; // Port server sẽ chạy
const PRODUCT_DATA_FILE = path.join(__dirname, "server-product-data.json");
const CART_DATA_FILE = path.join(__dirname, "server-cart-data.json");
const MOCK_API_TOKEN = "D6W69PRgCoDKgHZGJmRUNA-very-secure-token"; // Token giả lập để xác thực

// --- Middleware ---

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Thêm headers chống cache và CORS cơ bản (nếu cần, mặc dù proxy xử lý CORS)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  // Cho phép nguồn gốc từ dev server Vue (nếu không dùng proxy hoặc cần thêm)
  // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Thêm Authorization nếu dùng header token
  next();
});

// Middleware kiểm tra token cho các route cần xác thực
const requireToken = (req, res, next) => {
  // Lấy token từ query parameter (có thể đổi sang header nếu muốn)
  const token = req.query.token;
  console.log(`[Token Check] Route: ${req.path}, Token reçu: ${token}`);
  if (!token || token !== MOCK_API_TOKEN) {
    console.log("!!! Token không hợp lệ hoặc bị thiếu !!!");
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: Invalid or missing token",
      });
  }
  // Token hợp lệ, cho phép đi tiếp
  console.log("Token hợp lệ.");
  next();
};

// --- Hàm trợ giúp đọc và parse JSON an toàn ---
function readJsonFile(filePath, callback) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File không tồn tại
        console.warn(`File ${filePath} không tìm thấy. Trả về mảng rỗng.`);
        // Tạo file với mảng rỗng để lần sau có file để đọc
        fs.writeFile(filePath, "[]", (writeErr) => {
          if (writeErr) console.error(`Lỗi tạo file ${filePath}:`, writeErr);
        });
        return callback(null, []); // Trả về mảng rỗng
      }
      console.error(`Lỗi đọc file ${filePath}:`, err);
      return callback(err, null); // Trả về lỗi đọc file
    }

    if (!data || data.trim() === "") {
      // File trống
      console.warn(`File ${filePath} trống. Trả về mảng rỗng.`);
      return callback(null, []);
    }

    try {
      // Parse JSON
      const jsonData = JSON.parse(data);
      // Đảm bảo là mảng (cho cart và products)
      if (!Array.isArray(jsonData)) {
        console.warn(
          `Dữ liệu trong ${filePath} không phải mảng. Trả về mảng rỗng.`
        );
        return callback(null, []);
      }
      callback(null, jsonData);
    } catch (parseError) {
      console.error(`Lỗi parse JSON file ${filePath}:`, parseError);
      // Có thể tạo file mới với [] ở đây nếu muốn "tự sửa" lỗi parse
      fs.writeFile(filePath, "[]", (writeErr) => {
        if (writeErr)
          console.error(
            `Lỗi ghi lại file ${filePath} sau khi parse lỗi:`,
            writeErr
          );
      });
      callback(parseError, []); // Trả về lỗi parse nhưng vẫn đưa mảng rỗng để tránh lỗi khác
    }
  });
}

// --- API Endpoints ---

// POST /api/login - Không cần token
app.post("/api/login", (req, res) => {
  console.log("--- Yêu cầu POST /api/login nhận được ---");
  // Không cần kiểm tra body trong ví dụ này
  res.json({
    success: true,
    token: MOCK_API_TOKEN, // Trả về token giả lập
  });
  console.log("--- Đã trả về token cho /api/login ---");
});

// GET /api/products - Yêu cầu token
app.get("/api/products", requireToken, (req, res) => {
  // Áp dụng middleware requireToken
  console.log("--- Xử lý GET /api/products ---");
  readJsonFile(PRODUCT_DATA_FILE, (err, products) => {
    if (err && err.code !== "ENOENT") {
      // Bỏ qua lỗi ENOENT vì đã xử lý trong readJsonFile
      return res.status(500).send("Lỗi server khi lấy sản phẩm.");
    }
    res.json(products || []); // Trả về products hoặc mảng rỗng nếu có lỗi
  });
});

// GET /api/cart - Yêu cầu token
app.get("/api/cart", requireToken, (req, res) => {
  console.log("--- Xử lý GET /api/cart ---");
  readJsonFile(CART_DATA_FILE, (err, cart) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).send("Lỗi server khi lấy giỏ hàng.");
    }
    res.json(cart || []);
  });
});

// POST /api/cart - Yêu cầu token
app.post("/api/cart", requireToken, (req, res) => {
  console.log("--- Xử lý POST /api/cart ---");
  console.log("Request body:", req.body);
  readJsonFile(CART_DATA_FILE, (err, cartProducts) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).send("Lỗi server khi đọc giỏ hàng để thêm.");
    }
    // Đảm bảo cartProducts là mảng
    if (!Array.isArray(cartProducts)) cartProducts = [];

    const newCartProduct = req.body;

    // Nên kiểm tra dữ liệu newCartProduct trước khi xử lý
    if (
      !newCartProduct ||
      typeof newCartProduct.id === "undefined" ||
      typeof newCartProduct.price === "undefined"
    ) {
      console.error("Dữ liệu sản phẩm mới không hợp lệ:", newCartProduct);
      return res.status(400).send("Dữ liệu sản phẩm không hợp lệ."); // Bad Request
    }

    const existingProductIndex = cartProducts.findIndex(
      (item) => item.id === newCartProduct.id
    );

    if (existingProductIndex > -1) {
      cartProducts[existingProductIndex].quantity =
        (cartProducts[existingProductIndex].quantity || 0) + 1; // Đảm bảo quantity tồn tại
    } else {
      newCartProduct.quantity = 1;
      cartProducts.push(newCartProduct);
    }

    fs.writeFile(
      CART_DATA_FILE,
      JSON.stringify(cartProducts, null, 4),
      (writeErr) => {
        if (writeErr) {
          console.error("Lỗi ghi file cart:", writeErr);
          return res.status(500).send("Lỗi server khi lưu giỏ hàng.");
        }
        res.json(cartProducts);
        console.log("--- Kết thúc POST /api/cart ---");
      }
    );
  });
});

// POST /api/cart/delete - Yêu cầu token
app.post("/api/cart/delete", requireToken, (req, res) => {
  console.log("--- Xử lý POST /api/cart/delete ---");
  console.log("Request body:", req.body);
  readJsonFile(CART_DATA_FILE, (err, cartProducts) => {
    if (err && err.code !== "ENOENT") {
      return res.status(500).send("Lỗi server khi đọc giỏ hàng để xóa.");
    }
    if (!Array.isArray(cartProducts)) cartProducts = [];

    const productIdToDelete = req.body.id;
    if (typeof productIdToDelete === "undefined") {
      return res.status(400).send("Thiếu ID sản phẩm cần xóa.");
    }

    const updatedCart = cartProducts.reduce((acc, product) => {
      if (product.id === productIdToDelete) {
        if (product.quantity > 1) {
          acc.push({ ...product, quantity: product.quantity - 1 });
        } // Bỏ qua nếu quantity là 1
      } else {
        acc.push(product);
      }
      return acc;
    }, []);

    fs.writeFile(
      CART_DATA_FILE,
      JSON.stringify(updatedCart, null, 4),
      (writeErr) => {
        if (writeErr) {
          console.error("Lỗi ghi file cart sau khi xóa:", writeErr);
          return res
            .status(500)
            .send("Lỗi server khi lưu giỏ hàng sau khi xóa.");
        }
        res.json(updatedCart);
        console.log("--- Kết thúc POST /api/cart/delete ---");
      }
    );
  });
});

// POST /api/cart/delete/all - Yêu cầu token
app.post("/api/cart/delete/all", requireToken, (req, res) => {
  console.log("--- Xử lý POST /api/cart/delete/all ---");
  const emptyCart = [];
  fs.writeFile(
    CART_DATA_FILE,
    JSON.stringify(emptyCart, null, 4),
    (writeErr) => {
      if (writeErr) {
        console.error("Lỗi ghi file cart khi xóa tất cả:", writeErr);
        return res.status(500).send("Lỗi server khi xóa giỏ hàng.");
      }
      res.json(emptyCart);
      console.log("--- Kết thúc POST /api/cart/delete/all ---");
    }
  );
});

// --- Khởi động Server ---
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
  // Kiểm tra và tạo file nếu chưa tồn tại khi server khởi động
  if (!fs.existsSync(PRODUCT_DATA_FILE)) {
    console.log(`Tạo file ${PRODUCT_DATA_FILE} với dữ liệu mẫu.`);
    // Thay bằng dữ liệu sản phẩm mẫu thực tế của bạn
    const sampleProducts = [
      {
        id: 1,
        title: "Sample Hoodie",
        description: "A nice hoodie.",
        price: 29.99,
        product_type: "hoodie",
        image_tag: "hoodie.png",
        created_at: 2023,
      },
      {
        id: 2,
        title: "Sample Tee",
        description: "A cool tee.",
        price: 19.99,
        product_type: "tee",
        image_tag: "tee.png",
        created_at: 2023,
      },
    ];
    fs.writeFileSync(
      PRODUCT_DATA_FILE,
      JSON.stringify(sampleProducts, null, 4)
    );
  }
  if (!fs.existsSync(CART_DATA_FILE)) {
    console.log(`Tạo file ${CART_DATA_FILE} với mảng rỗng.`);
    fs.writeFileSync(CART_DATA_FILE, "[]");
  }
});

// Middleware bắt lỗi cuối cùng (nên đặt sau tất cả các route)
app.use((err, req, res, next) => {
  console.error("LỖI SERVER KHÔNG XÁC ĐỊNH:", err.stack);
  if (!res.headersSent) {
    // Chỉ gửi response nếu chưa có response nào được gửi
    res.status(500).send("Có lỗi xảy ra trên server!");
  }
});

// Bắt các Unhandled Promise Rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Trong môi trường production, bạn có thể muốn log lỗi này và khởi động lại server một cách an toàn
});
