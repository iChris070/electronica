import { Server } from 'azle';
import express, { NextFunction, Request, Response } from 'express';

type Book = {
    id: number;
    title: string;
    author: string;
}

let books: Book[] = [{
    id: 1,
    title: 'ciaphas cain hero of the imperium',
    author: 'Alex Stewart'
}]

function logger(req: Request, res: Response, next: NextFunction) {
    console.log("ok this works");
    next();
}

export default Server(() => {
    const app = express();

    app.use(express.json());

    app.use(logger);

    //GET
    app.get('/books', (req, res) => {
        res.json(books);
    });

    //POST
    app.post("/books/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const Book = req.body;
        const libroExistente = books.find((book) => book.id === id);
    
        if (libroExistente) {
            res.status(404).send("this book already exist");
            return;
        }
        books.push({ ...Book, id });
    
        res.send("OK");
    });

    //PUT
    app.put("/books/:id", (req, res) =>{
        const id = parseInt(req.params.id);
        const book = books.find((book) => book.id === id);

        if (!book) {
            res.status(404).send("Not found");
            return;
        }

        const updateBook = { ...book, ...req.body };

        books = books.map((b) => b.id === updateBook.id ? updateBook : b);

        res.send("ok");

    })

    //DELETE
    app.delete("/books/:id", (req, res) =>{
        const id = parseInt(req.params.id);
        books = books.filter((book) => book.id !== id);
        res.send("ok")
    });

    return app.listen();
});
