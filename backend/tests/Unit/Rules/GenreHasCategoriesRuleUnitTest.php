<?php
declare(strict_types=1);

namespace App\Rules;

use Mockery\MockInterface;
use ReflectionProperty;
use Tests\TestCase;

class GenreHasCategoriesRuleUnitTest extends TestCase
{
    public function testCategoriesIdField()
    {
        $rule = new GenresHasCategoriesRule(
            [1, 1, 2, 2]
        );
        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('categoriesId');
        $reflectionProperty->setAccessible(true);

        $categoriesId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $categoriesId);
    }

    public function testGenresIdValue()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([]);

        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturnNull();

        $rule->passes('', [1, 1, 2, 2]);

        $reflectionClass = new \ReflectionClass(GenresHasCategoriesRule::class);
        $reflectionProperty = $reflectionClass->getProperty('genresId');
        $reflectionProperty->setAccessible(true);

        $genresId = $reflectionProperty->getValue($rule);
        $this->assertEqualsCanonicalizing([1, 2], $genresId);
    }

    public function testPassesReturnsFalseWhenCategoriesOrGenresIsArrayEmpty()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([1]);
        $this->assertFalse($rule->passes('', []));

        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([]);
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenGetRowsIsEmpty()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([1]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect());
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPassesReturnsFalseWhenHasCategoriesWithoutGenres()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect(['category_id' => 1]));
        $this->assertFalse($rule->passes('', [1]));
    }

    public function testPasseIsValid()
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2]
            ]));
        $this->assertTrue($rule->passes('', [1]));

        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = $this->createRuleMock([1, 2]);
        $rule
            ->shouldReceive('getRows')
            ->withAnyArgs()
            ->andReturn(collect([
                ['category_id' => 1],
                ['category_id' => 2],
                ['category_id' => 1],
                ['category_id' => 2]
            ]));
        $this->assertTrue($rule->passes('', [1]));
    }

    public function createRuleMock(array $categoriesId): MockInterface
    {
        /** @var \Mockery\MockInterface|GenresHasCategoriesRule $rule */
        $rule = \Mockery::mock(GenresHasCategoriesRule::class, [$categoriesId]);

        return $rule
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();
    }
}