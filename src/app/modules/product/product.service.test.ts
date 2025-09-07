import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { IProduct } from './product.interface';
import { Product } from './product.model';
import { ProductServices } from './product.service';
import { Types } from 'mongoose';

// Mock the Product model
jest.mock('./product.model');

const ProductMock = Product as jest.Mocked<typeof Product>;

describe('ProductServices', () => {
  const mockProduct: IProduct = {
    _id: new Types.ObjectId(),
    product_title: 'Galaxy Tab S8+',
    product_image: 'https://example.com/image.jpg',
    category: 'Samsung',
    price: 599,
    description: 'A great tablet.',
    specification: ['12.4-inch display', '8GB RAM'],
    availability: true,
    rating: 4.8,
    quantityInStock: 10,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for createProductIntoDB
  describe('createProductIntoDB', () => {
    it('should create a product successfully', async () => {
      (ProductMock.findOne as jest.Mock).mockResolvedValue(null);
      (ProductMock.create as jest.Mock).mockResolvedValue(mockProduct);
      // Destructure to separate the payload for creation from the full document
      const { _id, ...creationPayload } = mockProduct;

      const result = await ProductServices.createProductIntoDB(creationPayload);

      expect(ProductMock.findOne).toHaveBeenCalledWith({
        product_title: creationPayload.product_title,
      });
      expect(ProductMock.create).toHaveBeenCalledWith(creationPayload);
      expect(result).toEqual(mockProduct);
    });

    it('should throw a conflict error if product title already exists', async () => {
      (ProductMock.findOne as jest.Mock).mockResolvedValue(mockProduct);
      const { _id, ...creationPayload } = mockProduct;

      await expect(ProductServices.createProductIntoDB(creationPayload)).rejects.toThrow(
        new AppError(httpStatus.CONFLICT, 'A product with this title already exists.'),
      );
    });
  });
  describe('getAllProductsFromDB', () => {
    it('should retrieve all products with default pagination and sorting', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockProduct]),
      };
      (ProductMock.find as jest.Mock).mockReturnValue(mockQuery);

      (ProductMock.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await ProductServices.getAllProductsFromDB({});

      expect(ProductMock.find).toHaveBeenCalledWith({});
      expect(mockQuery.sort).toHaveBeenCalledWith('-createdAt');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result.data).toEqual([mockProduct]);
      expect(result.meta.total).toBe(1);
    });

    it('should handle search, filter, and sort parameters', async () => {
        const mockQuery = {
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };
        (ProductMock.find as jest.Mock).mockReturnValue(mockQuery);

        (ProductMock.countDocuments as jest.Mock).mockResolvedValue(0);

        const query = {
          searchTerm: 'Galaxy',
          category: 'Samsung',
          minPrice: '500',
          maxPrice: '700',
          sort: 'price',
        };

        await ProductServices.getAllProductsFromDB(query);

        const searchRegex = new RegExp(query.searchTerm, 'i');
        expect(ProductMock.find).toHaveBeenCalledWith(expect.objectContaining({
          category: 'Samsung',
          price: { $gte: 500, $lte: 700 },
        }));
        expect(mockQuery.sort).toHaveBeenCalledWith('price');
      });
  });

  describe('getSingleProductFromDB', () => {
    it('should return a single product if found', async () => {
      (ProductMock.findById as jest.Mock).mockResolvedValue(mockProduct);
      const result = await ProductServices.getSingleProductFromDB('some-id');
      expect(ProductMock.findById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockProduct);
    });

    it('should throw a Not Found error if product is not found', async () => {
      (ProductMock.findById as jest.Mock).mockResolvedValue(null);
      await expect(ProductServices.getSingleProductFromDB('non-existent-id')).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Product not found'),
      );
    });
  });

  describe('updateProductIntoDB', () => {
    const updatePayload = { price: 650 };
    const updatedProduct = { ...mockProduct, ...updatePayload };

    it('should update a product successfully', async () => {
      (ProductMock.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ProductMock.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await ProductServices.updateProductIntoDB('some-id', updatePayload);

      expect(ProductMock.findById).toHaveBeenCalledWith('some-id');
      expect(ProductMock.findByIdAndUpdate).toHaveBeenCalledWith('some-id', updatePayload, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should throw a Not Found error if product to update is not found', async () => {
      (ProductMock.findById as jest.Mock).mockResolvedValue(null);
      await expect(ProductServices.updateProductIntoDB('non-existent-id', updatePayload)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Product not found'),
      );
    });

    it('should update availability to false when quantityInStock is set to 0', async () => {
      const stockUpdatePayload = { quantityInStock: 0 };
      // The service should automatically set availability to false
      const expectedPayloadInUpdate = { quantityInStock: 0, availability: false };
      const productAfterUpdate = { ...mockProduct, ...expectedPayloadInUpdate };

      (ProductMock.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ProductMock.findByIdAndUpdate as jest.Mock).mockResolvedValue(productAfterUpdate);

      const result = await ProductServices.updateProductIntoDB('some-id', stockUpdatePayload);

      expect(ProductMock.findById).toHaveBeenCalledWith('some-id');
      expect(ProductMock.findByIdAndUpdate).toHaveBeenCalledWith(
        'some-id',
        expectedPayloadInUpdate,
        { new: true, runValidators: true },
      );
      expect(result).toEqual(productAfterUpdate);
    });
  });

  describe('deleteProductFromDB', () => {
    it('should throw a Not Found error if product to delete is not found', async () => {
      (ProductMock.findById as jest.Mock).mockResolvedValue(null);
      await expect(ProductServices.deleteProductFromDB('non-existent-id')).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Product not found'),
      );
    });
  });
});