import { Category } from "../../data/database"

/****************************/
/*        CATEGORIES        */
/****************************/

export const createCategory = async (req, res, next) => {
  const { name } = req.body

  if(!name) {
    res.status(400).send({ message: "A name for the category has not been provided!" })
    return
  }

  const existingCategory = await Category.findOne({ where: { name } })

  if(existingCategory) {
    res.status(400).send({ message: "A category with that name already exists!" })
    return
  }

  const category = await Category.create({ name })

  res.status(201).send({ message: `Created category!`, category })
}

export const getCategories = async (req, res, next) => {
  const foundCategories = await Category.findAll({ attributes: [ 'name' ] });

  var categories = []

  foundCategories.forEach(val => {
    categories.push(val.name)
  })

  res.status(200).send({ categories })
}

export const removeCategory = async (req, res, next) => {
  const { id, name } = req.body

  if(!id && name) {
    const existingCategory = await Category.findOne({ where: { name } })

    if(!existingCategory) {
      res.status(400).send({ message: "Could not find a category with that name!" })
      return
    }

    existingCategory.destroy()

    res.status(200).send({ message: `Destroyed category with name ${name}.` })
  } else if(id && !name) {
    const existingCategory = await Category.findOne({ where: { id } })

    if(!existingCategory) {
      res.status(400).send({ message: "Could not find a category with that id!" })
      return
    }

    existingCategory.destroy()

    res.status(200).send({ message: `Destroyed category with id ${id}.` })
  } else if(!id && !name) {
    res.status(400).send({ message: "An id or name for the category to delete was not provided!" })
    return
  } else {
    const existingCategory = await Category.findOne({ where: { name, id } })

    if(!existingCategory) {
      res.status(400).send({ message: "Could not find a category with that id and name!" })
      return
    }

    existingCategory.destroy()

    res.status(200).send({ message: `Destroyed category with id ${id} and name ${name}.` })
  }
}