// === LOGIN OTOMATIS & 100% JALAN ===
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass = document.getElementById('password').value;

  if (!email || !pass) {
    Swal.fire('Error', 'Email dan password harus diisi!', 'error');
    return;
  }

  // Cek dari users yang sudah daftar
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === pass);

  if (user) {
    // Simpan user yang sedang login
    localStorage.setItem('currentUser', JSON.stringify({ nama: user.nama, email: user.email }));
    
    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil!',
      text: `Selamat datang kembali, ${user.nama}!`,
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = 'dashboard.html';
    });
  } else {
    Swal.fire('Gagal Login', 'Email atau password salah!', 'error');
  }
});

// === DAFTAR AKUN BARU + OTOMATIS LOGIN ===
document.getElementById('daftarForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nama = document.getElementById('namaDaftar').value.trim();
  const email = document.getElementById('emailDaftar').value.trim().toLowerCase();
  const pass = document.getElementById('passDaftar').value;

  // Validasi
  if (!nama || !email || !pass) {
    Swal.fire('Error', 'Semua field harus diisi!', 'error');
    return;
  }
  if (pass.length < 4) {
    Swal.fire('Error', 'Password minimal 4 karakter!', 'error');
    return;
  }

  // Cek apakah email sudah ada
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.email === email)) {
    Swal.fire('Gagal', 'Email sudah terdaftar!', 'error');
    return;
  }

  // Simpan user baru
  users.push({ nama, email, password: pass });
  localStorage.setItem('users', JSON.stringify(users));

  // OTOMATIS LOGIN SETELAH DAFTAR!
  localStorage.setItem('currentUser', JSON.stringify({ nama, email }));

  // SweetAlert sukses
  Swal.fire({
    icon: 'success',
    title: 'Akun Berhasil Dibuat!',
    html: `Selamat datang, <strong>${nama}</strong>!<br>Anda akan diarahkan ke dashboard...`,
    timer: 2000,
    timerProgressBar: true,
    willClose: () => {
      closeModal('modalDaftar');
      window.location.href = 'dashboard.html'; // LANGSUNG MASUK DASHBOARD!
    }
  });

  // Reset form
  document.getElementById('daftarForm').reset();
});

// === LUPA PASSWORD ===
document.getElementById('lupaForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('emailLupa').value.trim();

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email);

  if (!user) {
    Swal.fire('Tidak Ditemukan', 'Email tidak terdaftar', 'error');
    return;
  }

  const newPass = prompt(`Reset password untuk ${user.nama}\nMasukkan password baru:`);
  if (newPass && newPass.length >= 4) {
    user.password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    Swal.fire({
      icon: 'success',
      title: 'Password Berhasil Direset!',
      text: 'Silakan login dengan password baru',
      timer: 2000
    }).then(() => {
      closeModal('modalLupa');
      document.getElementById('email').value = email;
      document.getElementById('emailLupa').value = '';
    });
  } else if (newPass) {
    Swal.fire('Error', 'Password minimal 4 karakter', 'error');
  }
});

// === MODAL CONTROL (BARU & DIPERBAIKI) ===
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Tutup modal kalau klik luar
window.onclick = function(e) {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
};

// Buka modal Daftar & Lupa Password
document.getElementById('daftar')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal('modalDaftar');
});
document.getElementById('lupaPassword')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal('modalLupa');
});

// === GLOBAL ===
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];
let transaksiHistory = JSON.parse(localStorage.getItem('transaksiHistory')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// === UPDATE KERANJANG ===
function updateCartCount() {
  const count = keranjang.reduce((sum, item) => sum + item.jumlah, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

// === TAMPILKAN KATALOG CARD + TOMBOL BELI BERFUNGSI ===
function tampilkanStok() {
  const grid = document.getElementById('katalogGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let stok = JSON.parse(localStorage.getItem('dataKatalogBuku')) || dataKatalogBuku;

  stok.forEach(b => {
    const stokHabis = b.stok <= 0;
    const card = `
      <div class="book-card">
        <img src="${b.gambar}" alt="${b.judul}" onerror="this.src='https://via.placeholder.com/150x200/3498db/fff?text=No+Image'">
        <h3>${b.judul}</h3>
        <p><strong>Penulis:</strong> ${b.penulis}</p>
        <p><strong>Harga:</strong> <span class="harga">Rp ${b.harga.toLocaleString('id-ID')}</span></p>
        <p><strong>Stok:</strong> <span style="color:${stokHabis ? 'red' : 'green'}; font-weight:bold;">${b.stok}</span></p>
        <button class="beli-btn" ${stokHabis ? 'disabled' : ''} 
                onclick="${stokHabis ? '' : `tambahKeKeranjang(${b.id})`}">
          ${stokHabis ? 'Stok Habis' : 'Beli Sekarang'}
        </button>
      </div>`;
    grid.innerHTML += card;
  });
  updateCartCount();
}

// === TAMBAH KE KERANJANG ===
function tambahKeKeranjang(id) {
  let stok = JSON.parse(localStorage.getItem('dataKatalogBuku')) || dataKatalogBuku;
  const buku = stok.find(b => b.id === id);

  if (!buku || buku.stok <= 0) {
    Swal.fire('Error', 'Stok habis!', 'error');
    return;
  }

  const ada = keranjang.find(item => item.id === id);
  if (ada) {
    if (ada.jumlah < buku.stok) {
      ada.jumlah++;
    } else {
      Swal.fire('Stok Terbatas!', `Hanya tersedia ${buku.stok} buah`, 'warning');
      return;
    }
  } else {
    keranjang.push({ ...buku, jumlah: 1 });
  }

  localStorage.setItem('keranjang', JSON.stringify(keranjang));
  updateCartCount();
  tampilkanStok();
  Swal.fire({
    icon: 'success',
    title: 'Berhasil!',
    text: `${buku.judul} ditambahkan ke keranjang`,
    timer: 1500
  });
}

// === TAMPILKAN KERANJANG DI CHECKOUT ===
function tampilkanPesanan() {
  const tbody = document.querySelector('#tabelPesanan tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (keranjang.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Keranjang kosong</td></tr>';
    return;
  }

  let total = 0;
  keranjang.forEach((item, i) => {
    const subtotal = item.harga * item.jumlah;
    total += subtotal;
    tbody.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td><img src="${item.gambar}" width="50" onerror="this.src='https://via.placeholder.com/50'"> ${item.judul}</td>
        <td>Rp ${item.harga.toLocaleString()}</td>
        <td>
          <button onclick="kurangiJumlah(${item.id})">-</button>
          <strong>${item.jumlah}</strong>
          <button onclick="tambahJumlah(${item.id})">+</button>
        </td>
        <td>Rp ${subtotal.toLocaleString()}</td>
        <td><button onclick="hapusDariKeranjang(${item.id})" style="background:red; color:white;">Hapus</button></td>
      </tr>`;
  });

  tbody.innerHTML += `
    <tr style="background:#f0f7fa; font-weight:bold;">
      <td colspan="4">Total Belanja</td>
      <td colspan="2">Rp ${total.toLocaleString('id-ID')}</td>
    </tr>`;
}

// === KURANGI / TAMBAH JUMLAH ===
function tambahJumlah(id) {
  let stok = JSON.parse(localStorage.getItem('dataKatalogBuku')) || dataKatalogBuku;
  const buku = stok.find(b => b.id === id);
  const item = keranjang.find(i => i.id === id);
  if (item.jumlah < buku.stok) {
    item.jumlah++;
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    tampilkanPesanan();
    updateCartCount();
  }
}

function kurangiJumlah(id) {
  const item = keranjang.find(i => i.id === id);
  if (item.jumlah > 1) {
    item.jumlah--;
  } else {
    keranjang = keranjang.filter(i => i.id !== id);
  }
  localStorage.setItem('keranjang', JSON.stringify(keranjang));
  tampilkanPesanan();
  updateCartCount();
  tampilkanStok();
}

function hapusDariKeranjang(id) {
  keranjang = keranjang.filter(i => i.id !== id);
  localStorage.setItem('keranjang', JSON.stringify(keranjang));
  tampilkanPesanan();
  updateCartCount();
  tampilkanStok();
}

// === PROSES CHECKOUT + PEMBAYARAN LENGKAP ===
document.getElementById('formPesan')?.addEventListener('submit', function(e) {
  e.preventDefault();

  if (keranjang.length === 0) {
    Swal.fire('Keranjang Kosong!', 'Pilih buku dulu ya', 'warning');
    return;
  }

  const nama = document.getElementById('namaPemesan').value;
  const alamat = document.getElementById('alamat').value;
  const telepon = document.getElementById('telepon').value;
  const metode = document.getElementById('pembayaran').value;

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  const invoice = 'INV-' + Date.now().toString().slice(-6);

  const pesanan = {
    invoice,
    tanggal: new Date().toLocaleString('id-ID'),
    nama,
    alamat,
    telepon,
    metode,
    items: [...keranjang],
    total,
    status: metode === 'COD' ? 'Menunggu Pengiriman' : 'Menunggu Pembayaran'
  };

  transaksiHistory.push(pesanan);
  localStorage.setItem('transaksiHistory', JSON.stringify(transaksiHistory));

  // Kurangi stok
  let dataBuku = JSON.parse(localStorage.getItem('dataKatalogBuku')) || dataKatalogBuku;
  keranjang.forEach(item => {
    const buku = dataBuku.find(b => b.id === item.id);
    if (buku) buku.stok -= item.jumlah;
  });
  localStorage.setItem('dataKatalogBuku', JSON.stringify(dataBuku));

  // Kosongkan keranjang
  keranjang = [];
  localStorage.setItem('keranjang', JSON.stringify(keranjang));

  // Tampilkan invoice
  let detailItem = '';
  pesanan.items.forEach(item => {
    detailItem += `• ${item.judul} (x${item.jumlah}) = Rp ${(item.harga * item.jumlah).toLocaleString()}\n`;
  });

  Swal.fire({
    icon: 'success',
    title: 'Pesanan Berhasil!',
    html: `
      <h3>${invoice}</h3>
      <p><strong>Total: Rp ${total.toLocaleString('id-ID')}</strong></p>
      <p><strong>Metode: ${metode}</strong></p>
      ${metode !== 'COD' ? '<p>Silakan transfer ke:</p><strong>BNI 1234567890 a.n TOKO BUKU</strong>' : '<p>Kami akan hubungi untuk COD</p>'}
      <hr>
      <small>${detailItem}</small>
    `,
    confirmButtonText: 'Lihat di History'
  }).then(() => {
    window.location.href = 'dashboard.html';
  });
});

// === HISTORY TRANSAKSI DI DASHBOARD ===
function showHistory() {
  const table = document.getElementById('historyTable');
  const tbody = document.getElementById('historyBody');
  table.style.display = 'block';
  tbody.innerHTML = '';

  if (transaksiHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Belum ada transaksi</td></tr>';
    return;
  }

  transaksiHistory.slice().reverse().forEach((t, i) => {
    tbody.innerHTML += `
      <tr style="cursor:pointer;" onclick="detailTransaksi('${t.invoice}')">
        <td>${i+1}</td>
        <td>${t.tanggal}</td>
        <td>${t.invoice}</td>
        <td>${t.nama}</td>
        <td>${t.items.length} item</td>
        <td>Rp ${t.total.toLocaleString()}</td>
        <td><span style="padding:5px 10px; border-radius:8px; background:${t.status.includes('Menunggu') ? '#f39c12' : '#27ae60'}; color:white;">${t.status}</span></td>
      </tr>`;
  });
}

function detailTransaksi(invoice) {
  const t = transaksiHistory.find(x => x.invoice === invoice);
  let items = '';
  t.items.forEach(item => {
    items += `${item.judul} x${item.jumlah} = Rp ${(item.harga*item.jumlah).toLocaleString()}<br>`;
  });

  Swal.fire({
    title: invoice,
    html: `
      <p><strong>Tanggal:</strong> ${t.tanggal}</p>
      <p><strong>Nama:</strong> ${t.nama}</p>
      <p><strong>Metode:</strong> ${t.metode}</p>
      <hr>
      <p>${items}</p>
      <h3>Total: Rp ${t.total.toLocaleString('id-ID')}</h3>
      ${t.metode !== 'COD' ? '<p>Transfer ke: <strong>BNI 1234567890</strong></p>' : '<p>COD: Kami hubungi segera</p>'}
    `
  });
}

// === INIT ===
tampilkanStok();
tampilkanPesanan();
updateCartCount();
