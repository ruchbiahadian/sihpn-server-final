import express from "express";
import mysql from "mysql2";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const { sign, verify } = jwt;
const app = express();
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
    host:"containers-us-west-188.railway.app",
    user: "root",
    password: "MTkybple9G8wEuRjWV99",
    database: "railway",
    port: 7107
})

// Sending data from client
app.use(express.json());
app.use(cors({
    origin: "https://hadiahpendampingan.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(cookieParser());

// JWT
const createTokens = (user) =>{
    const accessToken = sign(
        { username: user.username },
        "ieusecret",
    );

    return accessToken;
}

// jwt middleware
const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"]
    if (!accessToken) return res.status(400).json({error: "user is not authenticated"});

    try {
        const validToken = verify(accessToken, "ieusecret")
        if(validToken){
            req.authenticated = true
            return next()
        }
    } catch (err) {
        return res.status(400).json({error: err})
    }
}

//  logout
app.post("/logout", validateToken, (req, res) =>{
    res.cookie("access-token", "", {
        maxAge: 0,
        httpOnly: true,
        sameSite: "none",
        secure: true,
    });
    return res.sendStatus(204);
});

// Searh Main
app.get("/:kode_unik", (req, res) =>{
    const q = "SELECT hadiah.pengajuan, hadiah.pembelian, hadiah.distribusi, hadiah.item, nasabah.nama, nasabah.priode, nasabah.kode_unik, nasabah.poin FROM hadiah INNER JOIN nasabah ON hadiah.id_nasabah=nasabah.id WHERE kode_unik = ?";
    const value = req.params.kode_unik
    
    db.query(q, value, (err, data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.post("/login", (req, res) =>{
    const q = "SELECT * FROM railway.admin WHERE username = ? AND password = ?";
    const values = [
        req.body.username,
        req.body.password
    ];
    
    db.query(q, [...values], (err, data) =>{
        if(err) return res.json(err);

        if (data.length > 0){
                const accessToken = createTokens(data);
                res.cookie("access-token", accessToken, {
                    maxAge: 3600000 * 6,
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                });
        }
        return res.json(data);
    })
})


// CRUD sentra
// Read sentra
app.get("/admin/sentra", validateToken, (req, res) =>{
    const q = "SELECT * FROM railway.sentra";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Add sentra
app.post("/admin/sentra/tambah", validateToken, (req, res) =>{
    const q = "INSERT INTO sentra (`nama`) VALUES (?)";
    const values = req.body.nama;

    
    db.query(q, [values], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Sentra baru berhasil ditambahkan");
    })
})

// Delete sentra
app.delete("/admin/sentra/:id", validateToken, (req, res) =>{
    const sentraId = req.params.id
    const q = "DELETE FROM sentra WHERE id = ?"

    db.query(q, [sentraId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu sentra berhasil dihapus");
    })
})

// Update sentra
app.put("/admin/sentra/update/:id", validateToken, (req, res) =>{
    const sentraId = req.params.id
    const q = "UPDATE sentra SET `nama` = ? WHERE id = ?"

    const values = req.body.nama;

    db.query(q, [values, sentraId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Sentra berhasil diupdate");
    })
})

// CRUD nasabah
// Read nasabah
app.get("/admin/nasabah", validateToken, (req, res) =>{
    const q = "SELECT * FROM railway.nasabah";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Read nasabah - priode
app.get("/admin/nasabah/priode", validateToken, (req, res) =>{
    const q = "SELECT priode FROM railway.nasabah GROUP BY priode";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Read nasabah by priode
app.get("/admin/nasabah/:priode", validateToken, (req, res) =>{

    const priode = req.params.priode
    const q = "SELECT * FROM railway.nasabah WHERE priode = ?";
    
    db.query(q, priode, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})


// Add nasabah
app.post("/admin/nasabah/tambah", validateToken, (req, res) =>{
    const q = "INSERT INTO nasabah (`id_sentra`, `nama`, `priode`, `sesi`, `kode_unik`, `poin`) VALUES (?)";
    const values = [
        Number(req.body.id_sentra),
        req.body.nama,
        req.body.priode,
        req.body.sesi,
        req.body.kode_unik,
        req.body.poin
    ];

    db.query(q, [values], (err, data) =>{
        if(err) return res.json(err);
        // return res.json("Nasabah baru berhasil ditambahkan");
        return res.json(data);
    })
})

// Update kode_unik
app.get("/admin/nasabah/update/kodeunik/:id", validateToken, (req, res) =>{

    const nasabahId = req.params.id.split("x")[0];
    const unik = req.params.id.split("x")[1];

    const q = "UPDATE nasabah SET `kode_unik` = ? WHERE id = ?"

    const kode_unik = nasabahId + unik;

    db.query(q, [kode_unik, nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Kode unik berhasil diupdate");
    })
})



// Delete nasabah
app.delete("/admin/nasabah/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM nasabah WHERE id = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu nasabah berhasil dihapus");
    })
})

// Update nasabah
app.put("/admin/nasabah/update/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "UPDATE nasabah SET `id_sentra` = ?, `nama` = ?, `priode` = ?, `sesi` = ?, `kode_unik` = ? WHERE id = ?"

    const kode_unik = nasabahId + req.body.priode;

    const values = [
        req.body.id_sentra,
        req.body.nama,
        req.body.priode,
        req.body.sesi,
        kode_unik,
    ];

    db.query(q, [...values, nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Nasabah berhasil diupdate");
    })
})

// CRUD hadiah
// Read hadiah
app.get("/admin/nasabah/hadiah/:id", validateToken, (req, res) =>{
    const q = "SELECT hadiah.pengajuan, hadiah.pembelian, hadiah.distribusi, hadiah.item, nasabah.kode_unik, nasabah.poin  FROM hadiah INNER JOIN nasabah ON hadiah.id_nasabah=nasabah.id WHERE nasabah.id = ?";
    const value = req.params.id
    
    db.query(q, value, (err, data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

// Update hadiah
app.post("/admin/nasabah/hadiah/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "UPDATE hadiah SET `pengajuan` = ?, `pembelian` = ?, `distribusi` = ?, `item` = ? WHERE id_nasabah = ?"

    const values = [
        req.body.pengajuan,
        req.body.pembelian,
        req.body.distribusi,
        req.body.hadiah
    ];

    db.query(q, [...values, nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Hadiah berhasil diupdate");
    })
})

// Add hadiah
app.get("/admin/hadiah/tambah/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id.split("x")[0];
    const sentraId = req.params.id.split("x")[1];
    
    const q = "INSERT INTO hadiah (`id_nasabah`, `id_sentra`, `pengajuan`, `pembelian`, `distribusi`, `item`) VALUES (?)";

    const values = [
        Number(nasabahId),
        Number(sentraId),
        0,
        0,
        0,
        "Hadiah Belum Dipilih"
    ];


    db.query(q, [values], (err, data) => {
        if(err) return res.json(err);
        return res.json("Hadiah berhasil diupdate");
    });
})

// Read all hadiah 
app.get("/admin/hadiah/tambah/:id", validateToken, (req, res) =>{
    const q = "SELECT * FROM railway.hadiah";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// delete hadiah with id nasabah
app.delete("/admin/hadiah/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM hadiah WHERE id_nasabah = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// delete hadiah with id sentra
app.delete("/admin/hadiah/sentra/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM hadiah WHERE id_sentra = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// delete nasabah with id sentra
app.delete("/admin/nasabah/sentra/:id", validateToken, (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM nasabah WHERE id_sentra = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// CRUD daftar-hadiah
// Get daftar-hadiah sorted by poin
app.get("/admin/daftar-hadiah/:poin", validateToken, (req, res) =>{
    const nasabahPoin = req.params.poin
    const q = "SELECT * FROM railway.daftar_hadiah WHERE poin <= ?";
    
    db.query(q, nasabahPoin, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Read daftar hadiah
app.get("/admin/daftar-hadiah/", validateToken, (req, res) =>{
    const nasabahPoin = req.params.poin
    const q = "SELECT * FROM railway.daftar_hadiah ORDER BY poin";
    
    db.query(q, nasabahPoin, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Delete daftar hadiah
app.delete("/admin/daftar-hadiah/:id", validateToken, (req, res) =>{
    const id = req.params.id
    const q = "DELETE FROM daftar_hadiah WHERE id = ?";
    
    db.query(q, id, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Add daftar hadiah
app.post("/admin/daftar-hadiah/tambah", validateToken, (req, res) =>{
    const nama = req.body.nama
    const poin = req.body.poin
    const q = "INSERT INTO daftar_hadiah (`hadiah`, `poin`) VALUES (?)";
    const values = [
        nama,
        poin
    ];

    
    db.query(q, [values], (err, data) =>{
        if(err) return res.json(err);
        return res.json("daftar hadiah baru berhasil ditambahkan");
    })
})

// Update hadiah
app.put("/admin/daftar-hadiah/update/:id", validateToken, (req, res) =>{
    const hadiahId = req.params.id
    const nama = req.body.nama
    const poin = req.body.poin
    const q = "UPDATE daftar_hadiah SET `hadiah` = ?, `poin` = ? WHERE id = ?";
    const values = [
        nama,
        poin
    ];

    
    db.query(q, [...values, hadiahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("daftar hadiah berhasil diupdate");
    })
})

// Read admin
app.get("/admin/update", validateToken, (req, res) =>{
    const q = "SELECT * FROM railway.admin";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

app.post("/admin/update", validateToken, (req, res) =>{
    const values = [
        req.body.username,
        req.body.password
    ];

    const q = "UPDATE admin SET `username` = ?, `password` = ?";

    db.query(q, [...values], (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

app.listen(port, () =>{
    console.log("Connected to backend!");
})