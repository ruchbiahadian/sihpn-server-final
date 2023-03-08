import express from "express";
import mysql from "mysql";
import cors from "cors"

const app = express();

// Db connection
const db = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "root",
    database: "sihpn"
})

// Sending data from client
app.use(express.json());
app.use(cors());

// Searh Main
app.get("/:kode_unik", (req, res) =>{
    const q = "SELECT hadiah.pengajuan, hadiah.pembelian, hadiah.distribusi, nasabah.nama, nasabah.priode, nasabah.kode_unik FROM hadiah INNER JOIN nasabah ON hadiah.id_nasabah=nasabah.id WHERE kode_unik = ?";
    const value = req.params.kode_unik
    
    db.query(q, value, (err, data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

// CRUD sentra
// Read sentra
app.get("/admin/sentra", (req, res) =>{
    const q = "SELECT * FROM sihpn.sentra";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);;
    });
})

// Add sentra
app.post("/admin/sentra/tambah", (req, res) =>{
    const q = "INSERT INTO sentra (`nama`) VALUES (?)";
    const values = req.body.nama;

    
    db.query(q, [values], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Sentra baru berhasil ditambahkan");
    })
})

// Delete sentra
app.delete("/admin/sentra/:id", (req, res) =>{
    const sentraId = req.params.id
    const q = "DELETE FROM sentra WHERE id = ?"

    db.query(q, [sentraId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu sentra berhasil dihapus");
    })
})

// Update sentra
app.put("/admin/sentra/update/:id", (req, res) =>{
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
app.get("/admin/nasabah", (req, res) =>{
    const q = "SELECT * FROM sihpn.nasabah";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// Add nasabah
app.post("/admin/nasabah/tambah", (req, res) =>{
    const q = "INSERT INTO nasabah (`id_sentra`, `nama`, `priode`, `sesi`, `kode_unik`) VALUES (?)";
    const values = [
        Number(req.body.id_sentra),
        req.body.nama,
        req.body.priode,
        req.body.sesi,
        req.body.kode_unik
    ];

    db.query(q, [values], (err, data) =>{
        if(err) return res.json(err);
        // return res.json("Nasabah baru berhasil ditambahkan");
        return res.json(data);
    })
})

// Update kode_unik
app.put("/admin/nasabah/update/kodeunik/:id", (req, res) =>{

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
app.delete("/admin/nasabah/:id", (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM nasabah WHERE id = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu nasabah berhasil dihapus");
    })
})

// Update nasabah
app.put("/admin/nasabah/update/:id", (req, res) =>{
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
app.get("/admin/nasabah/hadiah/:id", (req, res) =>{
    const q = "SELECT hadiah.pengajuan, hadiah.pembelian, hadiah.distribusi, nasabah.kode_unik FROM hadiah INNER JOIN nasabah ON hadiah.id_nasabah=nasabah.id WHERE nasabah.id = ?";
    const value = req.params.id
    
    db.query(q, value, (err, data) =>{
        if(err) return res.json(err);
        return res.json(data);
    })
})

// Update hadiah
app.put("/admin/nasabah/hadiah/:id", (req, res) =>{
    const nasabahId = req.params.id
    const q = "UPDATE hadiah SET `pengajuan` = ?, `pembelian` = ?, `distribusi` = ? WHERE id_nasabah = ?"

    const values = [
        req.body.pengajuan,
        req.body.pembelian,
        req.body.distribusi
    ];

    db.query(q, [...values, nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Hadiah berhasil diupdate");
    })
})

// Add hadiah
app.post("/admin/hadiah/tambah/:id", (req, res) =>{
    const nasabahId = req.params.id.split("x")[0];
    const sentraId = req.params.id.split("x")[1];
    
    const q = "INSERT INTO hadiah (`id_nasabah`, `id_sentra`, `pengajuan`, `pembelian`, `distribusi`) VALUES (?)";

    const values = [
        Number(nasabahId),
        Number(sentraId),
        0,
        0,
        0
    ];


    db.query(q, [values], (err, data) => {
        if(err) return res.json(err);
        return res.json("Hadiah berhasil diupdate");
    });
})

// Read all hadiah 
app.get("/admin/hadiah/tambah/:id", (req, res) =>{
    const q = "SELECT * FROM sihpn.hadiah";
    
    db.query(q, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    });
})

// delete hadiah with id nasabah
app.delete("/admin/hadiah/:id", (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM hadiah WHERE id_nasabah = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// delete hadiah with id sentra
app.delete("/admin/hadiah/sentra/:id", (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM hadiah WHERE id_sentra = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// delete nasabah with id sentra
app.delete("/admin/nasabah/sentra/:id", (req, res) =>{
    const nasabahId = req.params.id
    const q = "DELETE FROM nasabah WHERE id_sentra = ?"

    db.query(q, [nasabahId], (err, data) =>{
        if(err) return res.json(err);
        return res.json("Satu hadiah berhasil dihapus");
    })
})

// Nodemon
app.listen(8800, () =>{
    console.log("Connected to backend!");
})