import knex from '../database/connection'
import { Request, Response } from 'express'

class PointController {
    async index (request: Request, response: Response) {
        const { city, uf, items } = request.query

        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))

        const points = await knex('points')
            .join('point_items', 'point_id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`,
            }
        })
        return response.json(serializedPoints)

    }
    async create (request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body

        const trx = await knex.transaction() // para que uma query dependa da outra

        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
        const insertedIds = await trx('points').insert(point) // retorna um array de ids que foram cadastrados
        const point_id = insertedIds[0]


        const pointItems = items.split(',')
            .map((item: String) => Number(item.trim()))
            .map((item_id: Number) => {
                return {
                    item_id,
                    point_id: point_id
                }
            })

        await trx('point_items').insert(pointItems)

        await trx.commit()
        response.json({
            id: point_id,
            ...point
        })
    }

    async show (request: Request, response: Response) {
        const { id } = request.params

        const point = await knex('points').where('id', id).first()

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title')

        const serializedPoint = {
            ...point,
            image_url: `http://localhost:3333/uploads/${point.image}`
        }
        if (!point) {
            return response.status(400).json({ message: 'Point not found' })
        } else {
            return response.json({ serializedPoint, items })
        }
    }
}

export default PointController