import { Server, int } from 'azle';
import express, { NextFunction, Request, Response } from 'express';

type ElectronicComponent = {
    id: number;
    name: string;
    type: string;
    price: number;
}

let electronicComponents: ElectronicComponent[] = [{
    id: 1,
    name: 'Resistor',
    type: 'Passive',
    price: 22
}];

function logger(req: Request, res: Response, next: NextFunction) {
    console.log("ok this works");
    next();
}


export default Server(() => {
    const app = express();

    app.use(express.json());

    app.use(logger);

    //GET
    app.get('/components', (req, res) => {
        const totalPrices = electronicComponents.reduce((sum, component) => sum + component.price, 0);

        res.json({
            message: 'Lista de componentes:',
            components: electronicComponents,
            totalPrices: totalPrices
        });
    });

    //POST
    app.post("/components/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const component = req.body;
        const existingComponent = electronicComponents.find((c) => c.id === id);

        if (existingComponent) {
            res.status(404).send("This component already exists");
            return;
        }
        electronicComponents.push({ ...component, id });

        res.send("added component");

    });

    //PUT
    app.put("/components/:id", (req, res) => {
        const id = parseInt(req.params.id);
        const component = electronicComponents.find((c) => c.id === id);

        if (!component) {
            res.status(404).send("Component not found");
            return;
        }

        const updatedComponent = { ...component, ...req.body };

        electronicComponents = electronicComponents.map((c) => c.id === updatedComponent.id ? updatedComponent : c);

        res.send("OK");
    });

    //DELETE
    app.delete("/components/:id", (req, res) => {
        const id = parseInt(req.params.id);
        electronicComponents = electronicComponents.filter((c) => c.id !== id);
        res.send("removed component");
    });

    return app.listen();
});


