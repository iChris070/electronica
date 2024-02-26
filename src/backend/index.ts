import { Server } from 'azle';
import express, { NextFunction, Request, Response } from 'express';

type ElectronicComponent = {
    id: number;
    name: string;
    type: string;
    unitPrice: number; 
    amount: number;
}

let electronicComponents: ElectronicComponent[] = [{
    id: 1,
    name: 'Resistor',
    type: 'Passive',
    unitPrice: 22,
    amount: 1
}];

function logger(req: Request, res: Response, next: NextFunction) {
    console.log("its working");
    next();
}

export default Server(() => {
    const app = express();

    app.use(express.json());

    app.use(logger);

    // GET
    app.get('/components', (req, res) => {
        
        electronicComponents = electronicComponents.filter(c => c.id !== null && c.amount !== null);
        const totalPricesById: Record<number, number> = {};

        electronicComponents.forEach((component) => {
            const { id, unitPrice, amount } = component;

            if (totalPricesById[id] === undefined) {
                totalPricesById[id] = 0;
            }

            totalPricesById[id] += unitPrice * amount;
        });

        const summary = Object.entries(totalPricesById).map(([id, total]) => {
            const component = electronicComponents.find((c) => c.id === parseInt(id));
            return {
                id: parseInt(id),
                name: component?.name,
                quantity: component?.amount,
                unitPrice: component?.unitPrice,
                totalPrices: total,
            };
        });

        const grandTotalPrices = Object.values(totalPricesById).reduce((sum, total) => sum + total, 0);

        res.json({
            message: 'Resumen de componentes:',
            summary: summary,
            grandTotalPrices: grandTotalPrices,
        });
    });

    // POST
    app.post("/components", (req, res) => {
        const newComponent = req.body;
        const existingComponent = electronicComponents.find((c) => c.id === newComponent.id);

        if (existingComponent) {
            res.status(409).send("Component already exists");
            return;
        }
        electronicComponents.push(newComponent);

        res.json({
            message: "Component added successfully",
            newComponent: newComponent,
        });
    });

    app.post("/componentSalida", (req, res) => {
        const { id, quantity } = req.body;
        const component = electronicComponents.find((c) => c.id === id);
    
        if (!component) {
            res.status(404).send("Component not found");
            return;
        }
    
        if (quantity <= 0 || quantity > component.amount) {
            res.status(400).send("Invalid quantity");
            return;
        }
    
        component.amount -= quantity;
    
        res.json({
            message: "Component quantity updated successfully",
            updatedComponent: component,
            confirmation: `Sold ${quantity} unit(s) of ${component.name}`,
        });
    });

    // PUT
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

    // DELETE
    app.delete("/components/:id", (req, res) => {
        const id = parseInt(req.params.id);
        electronicComponents = electronicComponents.filter((c) => c.id !== id);
        res.send("Removed component");
    });

    return app.listen();
});
